using FluentMigrator;

namespace ECommerce.Api.FluentMigrations
{
    [Migration(202509301500)]
    public class AddCsvUploadJobs : Migration
    {
        public override void Up()
        {
            Create.Table("CsvUploadJobs")
                .WithColumn("Id").AsString(50).PrimaryKey().NotNullable()
                .WithColumn("FileName").AsString(255).NotNullable()
                .WithColumn("Status").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("TotalRows").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("ProcessedRows").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("SuccessfulRows").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("FailedRows").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("Errors").AsString().NotNullable().WithDefaultValue("[]")
                .WithColumn("CreatedProducts").AsString().NotNullable().WithDefaultValue("[]")
                .WithColumn("CreatedCategories").AsString().NotNullable().WithDefaultValue("[]")
                .WithColumn("CreatedSubcategories").AsString().NotNullable().WithDefaultValue("[]")
                .WithColumn("CreatedAtUtc").AsDateTime().NotNullable().WithDefault(SystemMethods.CurrentUTCDateTime)
                .WithColumn("StartedAtUtc").AsDateTime().Nullable()
                .WithColumn("CompletedAtUtc").AsDateTime().Nullable()
                .WithColumn("ErrorMessage").AsString(500).Nullable()
                .WithColumn("ProgressPercentage").AsInt32().NotNullable().WithDefaultValue(0)
                .WithColumn("FileSizeBytes").AsInt64().NotNullable().WithDefaultValue(0)
                .WithColumn("UploadedBy").AsString(100).Nullable();

            Create.Index("IX_CsvUploadJobs_Status")
                .OnTable("CsvUploadJobs")
                .OnColumn("Status");

            Create.Index("IX_CsvUploadJobs_CreatedAtUtc")
                .OnTable("CsvUploadJobs")
                .OnColumn("CreatedAtUtc");
        }

        public override void Down()
        {
            Delete.Index("IX_CsvUploadJobs_Status").OnTable("CsvUploadJobs");
            Delete.Index("IX_CsvUploadJobs_CreatedAtUtc").OnTable("CsvUploadJobs");
            Delete.Table("CsvUploadJobs");
        }
    }
}
