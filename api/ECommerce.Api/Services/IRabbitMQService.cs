namespace ECommerce.Api.Services
{
    public interface IRabbitMQService
    {
        Task PublishMessageAsync<T>(T message, string queueName, string exchange = "", string routingKey = "");
        Task<bool> IsHealthyAsync();
        void Dispose();
    }
}
