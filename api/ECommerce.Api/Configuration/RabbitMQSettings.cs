namespace ECommerce.Api.Configuration
{
    public class RabbitMQSettings
    {
        public const string SectionName = "RabbitMQ";
        
        public string Host { get; set; } = "localhost";
        public int Port { get; set; } = 5672;
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
        public string VirtualHost { get; set; } = "/";
        
        // Queue Names
        public string CsvProcessingQueue { get; set; } = "csv-processing-queue";
        public string CsvProcessingExchange { get; set; } = "csv-processing-exchange";
        public string CsvProcessingRoutingKey { get; set; } = "csv.process";
    }
}
