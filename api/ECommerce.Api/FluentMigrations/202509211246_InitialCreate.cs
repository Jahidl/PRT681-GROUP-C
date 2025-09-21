using FluentMigrator;

namespace ECommerce.Api.FluentMigrations
{
    [Migration(202509211246)]
    public class InitialCreate : Migration
    {
        public override void Up()
        {
            // Create Users table only if it doesn't exist
            if (!Schema.Table("Users").Exists())
            {
                Create.Table("Users")
                    .WithColumn("Id").AsGuid().PrimaryKey().NotNullable()
                    .WithColumn("FirstName").AsString(100).NotNullable()
                    .WithColumn("LastName").AsString(100).NotNullable()
                    .WithColumn("PhoneNumber").AsString(30).Nullable()
                    .WithColumn("EmailAddress").AsString(256).NotNullable()
                    .WithColumn("PasswordHash").AsString().NotNullable()
                    .WithColumn("CreatedAtUtc").AsDateTime2().NotNullable()
                    .WithColumn("LastLoginAtUtc").AsDateTime2().Nullable();

                // Create unique index on EmailAddress
                Create.Index("IX_Users_EmailAddress")
                    .OnTable("Users")
                    .OnColumn("EmailAddress")
                    .Unique();
            }

            // Create Categories table only if it doesn't exist
            if (!Schema.Table("Categories").Exists())
            {
                Create.Table("Categories")
                    .WithColumn("Id").AsString(450).PrimaryKey().NotNullable()
                    .WithColumn("Name").AsString(100).NotNullable()
                    .WithColumn("Description").AsString(500).NotNullable()
                    .WithColumn("Image").AsString(2048).NotNullable()
                    .WithColumn("CreatedAtUtc").AsDateTime2().NotNullable()
                    .WithColumn("UpdatedAtUtc").AsDateTime2().Nullable()
                    .WithColumn("IsActive").AsBoolean().NotNullable()
                    .WithColumn("SortOrder").AsInt32().NotNullable();

                // Create unique index on Name
                Create.Index("IX_Categories_Name")
                    .OnTable("Categories")
                    .OnColumn("Name")
                    .Unique();
            }
        }

        public override void Down()
        {
            Delete.Table("Categories");
            Delete.Table("Users");
        }
    }
}
