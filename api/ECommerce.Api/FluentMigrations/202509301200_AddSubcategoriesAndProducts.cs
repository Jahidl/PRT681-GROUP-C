using FluentMigrator;

namespace ECommerce.Api.FluentMigrations
{
    [Migration(202509301200)]
    public class AddSubcategoriesAndProducts : Migration
    {
        public override void Up()
        {
            // Create Subcategories table if it doesn't exist
            if (!Schema.Table("Subcategories").Exists())
            {
                Create.Table("Subcategories")
                    .WithColumn("Id").AsString(450).PrimaryKey().NotNullable()
                    .WithColumn("Name").AsString(100).NotNullable()
                    .WithColumn("Description").AsString(500).NotNullable()
                    .WithColumn("Image").AsString(2048).Nullable()
                    .WithColumn("CategoryId").AsString(450).NotNullable()
                    .WithColumn("CreatedAtUtc").AsDateTime2().NotNullable()
                    .WithColumn("UpdatedAtUtc").AsDateTime2().Nullable()
                    .WithColumn("IsActive").AsBoolean().NotNullable()
                    .WithColumn("SortOrder").AsInt32().NotNullable();

                // FK to Categories with restrict-on-delete to enable safe delete checks at app level
                Create.ForeignKey("FK_Subcategories_Categories_CategoryId")
                    .FromTable("Subcategories").ForeignColumn("CategoryId")
                    .ToTable("Categories").PrimaryColumn("Id")
                    .OnDelete(System.Data.Rule.None);

                // Useful indexes
                Create.Index("IX_Subcategories_CategoryId")
                    .OnTable("Subcategories")
                    .OnColumn("CategoryId").Ascending();

                Create.Index("IX_Subcategories_CategoryId_Name")
                    .OnTable("Subcategories")
                    .OnColumn("CategoryId").Ascending()
                    .OnColumn("Name").Ascending()
                    .WithOptions().Unique();
            }

            // Create Products table if it doesn't exist
            if (!Schema.Table("Products").Exists())
            {
                Create.Table("Products")
                    .WithColumn("Id").AsString(450).PrimaryKey().NotNullable()
                    .WithColumn("Name").AsString(200).NotNullable()
                    .WithColumn("Description").AsString(2000).NotNullable()
                    .WithColumn("Price").AsDecimal(18, 2).NotNullable()
                    .WithColumn("OriginalPrice").AsDecimal(18, 2).Nullable()
                    .WithColumn("CategoryId").AsString(450).NotNullable()
                    .WithColumn("SubcategoryId").AsString(450).Nullable()
                    .WithColumn("Brand").AsString(100).NotNullable()
                    .WithColumn("Rating").AsDouble().NotNullable()
                    .WithColumn("ReviewCount").AsInt32().NotNullable()
                    .WithColumn("InStock").AsBoolean().NotNullable()
                    .WithColumn("StockCount").AsInt32().NotNullable()
                    .WithColumn("Images").AsString(int.MaxValue).NotNullable()
                    .WithColumn("Features").AsString(int.MaxValue).NotNullable()
                    .WithColumn("Specifications").AsString(int.MaxValue).NotNullable()
                    .WithColumn("Tags").AsString(int.MaxValue).NotNullable()
                    .WithColumn("Sizes").AsString(int.MaxValue).Nullable()
                    .WithColumn("Colors").AsString(int.MaxValue).Nullable()
                    .WithColumn("CreatedAtUtc").AsDateTime2().NotNullable()
                    .WithColumn("UpdatedAtUtc").AsDateTime2().Nullable()
                    .WithColumn("IsActive").AsBoolean().NotNullable();

                // FKs to Categories and Subcategories, restrict deletes
                Create.ForeignKey("FK_Products_Categories_CategoryId")
                    .FromTable("Products").ForeignColumn("CategoryId")
                    .ToTable("Categories").PrimaryColumn("Id")
                    .OnDelete(System.Data.Rule.None);

                Create.ForeignKey("FK_Products_Subcategories_SubcategoryId")
                    .FromTable("Products").ForeignColumn("SubcategoryId")
                    .ToTable("Subcategories").PrimaryColumn("Id")
                    .OnDelete(System.Data.Rule.None);

                // Useful indexes
                Create.Index("IX_Products_CategoryId")
                    .OnTable("Products")
                    .OnColumn("CategoryId").Ascending();

                Create.Index("IX_Products_SubcategoryId")
                    .OnTable("Products")
                    .OnColumn("SubcategoryId").Ascending();

                Create.Index("IX_Products_IsActive_Name")
                    .OnTable("Products")
                    .OnColumn("IsActive").Ascending()
                    .OnColumn("Name").Ascending();
            }
        }

        public override void Down()
        {
            if (Schema.Table("Products").Exists())
            {
                Delete.Table("Products");
            }

            if (Schema.Table("Subcategories").Exists())
            {
                Delete.Table("Subcategories");
            }
        }
    }
}


