using ECommerce.Api.Configuration;
using ECommerce.Api.Data;
using ECommerce.Api.DTOs;
using ECommerce.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace ECommerce.Api.Services
{
    public class CsvProcessingWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly RabbitMQSettings _rabbitMQSettings;
        private readonly ILogger<CsvProcessingWorker> _logger;
        private IConnection? _connection;
        private IModel? _channel;

        public CsvProcessingWorker(
            IServiceProvider serviceProvider,
            IOptions<RabbitMQSettings> rabbitMQSettings,
            ILogger<CsvProcessingWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _rabbitMQSettings = rabbitMQSettings.Value;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CSV Processing Worker starting...");

            try
            {
                InitializeRabbitMQ();
                await StartConsumingAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CSV Processing Worker");
                throw;
            }
        }

        private void InitializeRabbitMQ()
        {
            var factory = new ConnectionFactory
            {
                HostName = _rabbitMQSettings.Host,
                Port = _rabbitMQSettings.Port,
                UserName = _rabbitMQSettings.Username,
                Password = _rabbitMQSettings.Password,
                VirtualHost = _rabbitMQSettings.VirtualHost,
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            // Ensure queue exists
            _channel.QueueDeclare(
                queue: _rabbitMQSettings.CsvProcessingQueue,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            // Set QoS to process one message at a time
            _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            _logger.LogInformation("RabbitMQ connection established for worker");
        }

        private async Task StartConsumingAsync(CancellationToken stoppingToken)
        {
            var consumer = new EventingBasicConsumer(_channel);
            
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var messageJson = Encoding.UTF8.GetString(body);
                
                try
                {
                    var message = JsonSerializer.Deserialize<CsvProcessingMessage>(messageJson);
                    if (message != null)
                    {
                        _logger.LogInformation("Processing CSV job: {JobId}", message.JobId);
                        await ProcessCsvJobAsync(message);
                        _channel?.BasicAck(ea.DeliveryTag, false);
                        _logger.LogInformation("CSV job completed: {JobId}", message.JobId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing CSV job from message: {Message}", messageJson);
                    
                    // Reject message and don't requeue to avoid infinite loops
                    _channel?.BasicNack(ea.DeliveryTag, false, false);
                    
                    // Try to update job status to failed
                    try
                    {
                        var failedMessage = JsonSerializer.Deserialize<CsvProcessingMessage>(messageJson);
                        if (failedMessage != null)
                        {
                            await UpdateJobStatusAsync(failedMessage.JobId, JobStatus.Failed, ex.Message);
                        }
                    }
                    catch (Exception updateEx)
                    {
                        _logger.LogError(updateEx, "Failed to update job status to failed");
                    }
                }
            };

            _channel.BasicConsume(
                queue: _rabbitMQSettings.CsvProcessingQueue,
                autoAck: false,
                consumer: consumer);

            _logger.LogInformation("Started consuming messages from queue: {Queue}", _rabbitMQSettings.CsvProcessingQueue);

            // Keep the worker running
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task ProcessCsvJobAsync(CsvProcessingMessage message)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var csvProcessor = scope.ServiceProvider.GetRequiredService<ICsvProcessingService>();

            // Update job status to processing
            await UpdateJobStatusAsync(message.JobId, JobStatus.Processing, null, 0);

            try
            {
                // Process the CSV content
                var result = await csvProcessor.ProcessCsvAsync(
                    message.CsvContent, 
                    message.JobId,
                    async (progress) => await UpdateJobProgressAsync(message.JobId, progress));

                // Update job with final results
                var job = await dbContext.CsvUploadJobs.FirstOrDefaultAsync(j => j.Id == message.JobId);
                if (job != null)
                {
                    job.Status = JobStatus.Completed;
                    job.CompletedAtUtc = DateTime.UtcNow;
                    job.TotalRows = result.TotalRows;
                    job.ProcessedRows = result.TotalRows;
                    job.SuccessfulRows = result.SuccessfulRows;
                    job.FailedRows = result.FailedRows;
                    job.ProgressPercentage = 100;
                    job.Errors = JsonSerializer.Serialize(result.Errors);
                    job.CreatedProducts = JsonSerializer.Serialize(result.CreatedProducts);
                    job.CreatedCategories = JsonSerializer.Serialize(result.CreatedCategories);
                    job.CreatedSubcategories = JsonSerializer.Serialize(result.CreatedSubcategories);

                    await dbContext.SaveChangesAsync();
                }

                _logger.LogInformation("CSV job {JobId} completed successfully. Created {SuccessfulRows} products", 
                    message.JobId, result.SuccessfulRows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing CSV job {JobId}", message.JobId);
                await UpdateJobStatusAsync(message.JobId, JobStatus.Failed, ex.Message);
                throw;
            }
        }

        private async Task UpdateJobStatusAsync(string jobId, JobStatus status, string? errorMessage = null, int? progress = null)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var job = await dbContext.CsvUploadJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job != null)
            {
                job.Status = status;
                if (status == JobStatus.Processing && job.StartedAtUtc == null)
                {
                    job.StartedAtUtc = DateTime.UtcNow;
                }
                if (status == JobStatus.Failed || status == JobStatus.Completed)
                {
                    job.CompletedAtUtc = DateTime.UtcNow;
                }
                if (errorMessage != null)
                {
                    job.ErrorMessage = errorMessage;
                }
                if (progress.HasValue)
                {
                    job.ProgressPercentage = progress.Value;
                }

                await dbContext.SaveChangesAsync();
            }
        }

        private async Task UpdateJobProgressAsync(string jobId, CsvProcessingProgress progress)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var job = await dbContext.CsvUploadJobs.FirstOrDefaultAsync(j => j.Id == jobId);
            if (job != null)
            {
                job.TotalRows = progress.TotalRows;
                job.ProcessedRows = progress.ProcessedRows;
                job.SuccessfulRows = progress.SuccessfulRows;
                job.FailedRows = progress.FailedRows;
                job.ProgressPercentage = progress.ProgressPercentage;

                await dbContext.SaveChangesAsync();
            }
        }

        public override void Dispose()
        {
            _channel?.Close();
            _channel?.Dispose();
            _connection?.Close();
            _connection?.Dispose();
            base.Dispose();
        }
    }
}
