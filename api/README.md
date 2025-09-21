# ECommerce API

A .NET 9 microservices-based e-commerce API with authentication and category management.

## Running with Docker

### Prerequisites

- Docker and Docker Compose installed
- Ports 1433 (SQL Server) and 8080 (API) available

### Quick Start

1. **Build and run all services:**

   ```bash
   docker-compose up --build
   ```

2. **Access the API:**
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger

3. **Stop the services:**

   ```bash
   docker-compose down
   ```

4. **Reset database (if needed):**
   ```bash
   ./reset-database.sh
   ```

### Database Configuration

The application will automatically:

- Create the SQL Server database (`SportStoreDb`)
- Run FluentMigrator migrations to create tables (`Users`, `Categories`)
- Apply proper constraints and indexes
- Handle schema updates through FluentMigrator
- Provide better control over database schema management

### Connection String Options

The application checks for connection strings in this order:

1. `appsettings.json` - `ConnectionStrings:DefaultConnection`
2. Environment variable - `CONNECTION_STRING`
3. Fallback to default Docker configuration

### Testing the API

**Create a category:**

```bash
curl -X POST "http://localhost:8080/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "image": "https://example.com/electronics.jpg",
    "isActive": true,
    "sortOrder": 1
  }'
```

**Get all categories:**

```bash
curl -X GET "http://localhost:8080/api/categories" \
  -H "Accept: application/json"
```

**Get category by ID:**

```bash
curl -X GET "http://localhost:8080/api/categories/{category-id}" \
  -H "Accept: application/json"
```

**Register a user:**

```bash
curl -X POST "http://localhost:8080/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "john.doe@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

## Available Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Categories

- `GET /api/categories` - Get all active categories (sorted by SortOrder, then Name)
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Other

- `GET /weatherforecast` - Sample weather endpoint
- `GET /` - Redirects to Swagger UI

## Architecture

- **ECommerce.Api** - Main API with authentication and category management
- **ECommerce.CatalogApi** - Product catalog microservice
- **ECommerce.OrdersApi** - Order processing microservice
- **ECommerce.Api.Tests** - Integration tests

## Migration System

This project uses **FluentMigrator** for database schema management, which provides:

- **Database-agnostic migrations** - Easy to switch between SQL Server, PostgreSQL, MySQL, etc.
- **Fluent API** - Clean, readable migration code
- **Version control** - Track schema changes with numbered migrations
- **Rollback support** - Ability to rollback migrations if needed
- **Better Docker support** - More reliable database creation in containerized environments

### Adding New Migrations

To add a new migration:

1. Create a new file in `FluentMigrations/` folder
2. Use timestamp format: `YYYYMMDDHHMM_MigrationName.cs`
3. Inherit from `Migration` and implement `Up()` and `Down()` methods

Example:

```csharp
[Migration(202509211300)]
public class AddProductsTable : Migration
{
    public override void Up()
    {
        Create.Table("Products")
            .WithColumn("Id").AsInt32().PrimaryKey().Identity()
            .WithColumn("Name").AsString(200).NotNullable()
            .WithColumn("Price").AsDecimal(18, 2).NotNullable();
    }

    public override void Down()
    {
        Delete.Table("Products");
    }
}
```

## Database Schema

### Users Table

- Id (uniqueidentifier, PK)
- FirstName, LastName (nvarchar)
- EmailAddress (nvarchar, unique)
- PasswordHash (nvarchar)
- PhoneNumber (nvarchar, nullable)
- CreatedAtUtc, LastLoginAtUtc (datetime2)

### Categories Table

- Id (nvarchar, PK)
- Name (nvarchar, unique)
- Description (nvarchar)
- Image (nvarchar)
- CreatedAtUtc, UpdatedAtUtc (datetime2)
- IsActive (bit)
- SortOrder (int)

## Troubleshooting

### Database Issues

**Problem**: "Invalid object name 'Categories'" or "There is already an object named 'Users' in the database"

**Solution**:

1. Use the reset script: `./reset-database.sh`
2. Or manually reset:
   ```bash
   docker-compose down
   docker volume rm prt681-group-c_sqlserver_data
   docker-compose up --build
   ```

**Problem**: FluentMigrator fails to create tables

**Solution**: The migration includes existence checks and will skip creating tables that already exist. Check the logs for specific error details.

### Docker Issues

**Problem**: Port conflicts (1433 or 8080 already in use)

**Solution**:

- Stop other services using these ports
- Or modify ports in `docker-compose.yml`

**Problem**: SQL Server container fails to start

**Solution**:

- Ensure you have enough memory allocated to Docker (at least 2GB)
- Check Docker logs: `docker-compose logs sqlserver`

### Development Tips

- Use `docker-compose logs ecommerce-api` to view API logs
- Use `docker-compose logs sqlserver` to view database logs
- The API includes detailed migration logging in development mode
- FluentMigrator provides better error messages than Entity Framework migrations

### Running Tests

**Run all tests with detailed output:**

```bash
cd ECommerce.Api.Tests && dotnet test --logger "console;verbosity=detailed"
```

**Run specific test class:**

```bash
cd ECommerce.Api.Tests && dotnet test --filter "CategoryEndpointsTests" --logger "console;verbosity=detailed"
```

**Run specific test method:**

```bash
cd ECommerce.Api.Tests && dotnet test --filter "Get_Categories_Returns_Empty_List_When_No_Categories" --logger "console;verbosity=detailed"
```

The test suite includes 13 comprehensive tests covering all category endpoints:

- 4 GET endpoint tests (1 passing, 3 need fixes)
- 4 POST endpoint tests (3 passing, 1 needs fix)
- 3 PUT endpoint tests (1 passing, 2 need fixes)
- 2 DELETE endpoint tests (2 passing)

**Current Status**: 7/13 tests passing. The remaining tests need minor fixes for test isolation and data persistence within individual test methods.
