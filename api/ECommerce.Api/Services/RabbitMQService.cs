using ECommerce.Api.Configuration;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace ECommerce.Api.Services
{
    public class RabbitMQService : IRabbitMQService, IDisposable
    {
        private readonly RabbitMQSettings _settings;
        private readonly ILogger<RabbitMQService> _logger;
        private IConnection? _connection;
        private IModel? _channel;
        private readonly object _lock = new object();

        public RabbitMQService(IOptions<RabbitMQSettings> settings, ILogger<RabbitMQService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
            InitializeRabbitMQ();
        }

        private void InitializeRabbitMQ()
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _settings.Host,
                    Port = _settings.Port,
                    UserName = _settings.Username,
                    Password = _settings.Password,
                    VirtualHost = _settings.VirtualHost,
                    RequestedHeartbeat = TimeSpan.FromSeconds(60),
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                    AutomaticRecoveryEnabled = true
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Declare exchange and queue
                _channel.ExchangeDeclare(
                    exchange: _settings.CsvProcessingExchange,
                    type: ExchangeType.Direct,
                    durable: true,
                    autoDelete: false
                );

                _channel.QueueDeclare(
                    queue: _settings.CsvProcessingQueue,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null
                );

                _channel.QueueBind(
                    queue: _settings.CsvProcessingQueue,
                    exchange: _settings.CsvProcessingExchange,
                    routingKey: _settings.CsvProcessingRoutingKey
                );

                _logger.LogInformation("RabbitMQ connection established successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize RabbitMQ connection");
                throw;
            }
        }

        public async Task PublishMessageAsync<T>(T message, string queueName, string exchange = "", string routingKey = "")
        {
            await Task.Run(() =>
            {
                lock (_lock)
                {
                    try
                    {
                        if (_channel == null || _channel.IsClosed)
                        {
                            _logger.LogWarning("RabbitMQ channel is closed, attempting to reconnect");
                            InitializeRabbitMQ();
                        }

                        var json = JsonSerializer.Serialize(message);
                        var body = Encoding.UTF8.GetBytes(json);

                        var properties = _channel!.CreateBasicProperties();
                        properties.Persistent = true;
                        properties.MessageId = Guid.NewGuid().ToString();
                        properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                        var exchangeToUse = string.IsNullOrEmpty(exchange) ? _settings.CsvProcessingExchange : exchange;
                        var routingKeyToUse = string.IsNullOrEmpty(routingKey) ? _settings.CsvProcessingRoutingKey : routingKey;

                        _channel.BasicPublish(
                            exchange: exchangeToUse,
                            routingKey: routingKeyToUse,
                            basicProperties: properties,
                            body: body
                        );

                        _logger.LogInformation("Message published to RabbitMQ: {MessageId}", properties.MessageId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to publish message to RabbitMQ");
                        throw;
                    }
                }
            });
        }

        public async Task<bool> IsHealthyAsync()
        {
            return await Task.FromResult(_connection?.IsOpen == true && _channel?.IsOpen == true);
        }

        public void Dispose()
        {
            try
            {
                _channel?.Close();
                _channel?.Dispose();
                _connection?.Close();
                _connection?.Dispose();
                _logger.LogInformation("RabbitMQ connection disposed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing RabbitMQ connection");
            }
        }
    }
}
