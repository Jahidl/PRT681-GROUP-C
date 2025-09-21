using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using ECommerce.Api.DTOs;
using FluentAssertions;
using Xunit;

namespace ECommerce.Api.Tests
{
    public class CategoryEndpointsTests
    {
        private CustomWebApplicationFactory CreateFactory()
        {
            return new CustomWebApplicationFactory();
        }

        #region GET Tests

        [Fact]
        public async Task Get_Categories_Returns_Empty_List_When_No_Categories()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var response = await client.GetAsync("/api/categories");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var categories = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
            categories.Should().NotBeNull();
            categories.Should().BeEmpty();
        }

        [Fact]
        public async Task Get_Categories_Returns_Only_Active_Categories_Sorted_By_SortOrder()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            // Create multiple categories with different sort orders and active status
            var category1 = new CreateCategoryRequest
            {
                Name = "Electronics",
                Description = "Electronic devices",
                Image = "https://example.com/electronics.jpg",
                IsActive = true,
                SortOrder = 2
            };

            var category2 = new CreateCategoryRequest
            {
                Name = "Books",
                Description = "Books and literature",
                Image = "https://example.com/books.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var category3 = new CreateCategoryRequest
            {
                Name = "Inactive Category",
                Description = "This should not appear",
                Image = "https://example.com/inactive.jpg",
                IsActive = false,
                SortOrder = 0
            };

            // Create categories and verify they were created
            var response1 = await client.PostAsJsonAsync("/api/categories", category1);
            response1.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var response2 = await client.PostAsJsonAsync("/api/categories", category2);
            response2.StatusCode.Should().Be(HttpStatusCode.Created);
            
            var response3 = await client.PostAsJsonAsync("/api/categories", category3);
            response3.StatusCode.Should().Be(HttpStatusCode.Created);

            // Get all categories
            var response = await client.GetAsync("/api/categories");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var categories = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
            categories.Should().NotBeNull();
            categories.Should().HaveCount(2); // Only active categories
            categories![0].Name.Should().Be("Books"); // SortOrder 1 comes first
            categories[1].Name.Should().Be("Electronics"); // SortOrder 2 comes second
        }

        [Fact]
        public async Task Get_Category_By_Id_Returns_Category_When_Exists()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            // Create a category first
            var createRequest = new CreateCategoryRequest
            {
                Name = "Test Category",
                Description = "Test description",
                Image = "https://example.com/test.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var createResponse = await client.PostAsJsonAsync("/api/categories", createRequest);
            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();

            // Get the category by ID
            var response = await client.GetAsync($"/api/categories/{createdCategory!.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var category = await response.Content.ReadFromJsonAsync<CategoryResponse>();
            category.Should().NotBeNull();
            category!.Id.Should().Be(createdCategory.Id);
            category.Name.Should().Be(createRequest.Name);
            category.Description.Should().Be(createRequest.Description);
        }

        [Fact]
        public async Task Get_Category_By_Id_Returns_NotFound_When_Category_Does_Not_Exist()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var response = await client.GetAsync("/api/categories/non-existent-id");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        #endregion

        #region POST Tests

        [Fact]
        public async Task Post_Categories_Creates_Category()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var request = new CreateCategoryRequest
            {
                Name = "Team Sports",
                Description = "All team sports equipment",
                Image = "https://example.com/cat/team-sports.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var response = await client.PostAsJsonAsync("/api/categories", request);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var body = await response.Content.ReadFromJsonAsync<CategoryResponse>();
            body.Should().NotBeNull();
            body!.Id.Should().NotBeNullOrEmpty();
            body.Name.Should().Be(request.Name);
            body.Description.Should().Be(request.Description);
            body.Image.Should().Be(request.Image);
            body.IsActive.Should().BeTrue();
            body.SortOrder.Should().Be(1);
        }

        [Fact]
        public async Task Post_Categories_Returns_BadRequest_When_Request_Is_Null()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var response = await client.PostAsJsonAsync("/api/categories", (CreateCategoryRequest?)null);
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Post_Categories_Returns_Conflict_When_Category_Name_Already_Exists()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var request = new CreateCategoryRequest
            {
                Name = "Duplicate Category",
                Description = "First category",
                Image = "https://example.com/first.jpg",
                IsActive = true,
                SortOrder = 1
            };

            // Create first category
            await client.PostAsJsonAsync("/api/categories", request);

            // Try to create second category with same name
            var duplicateRequest = new CreateCategoryRequest
            {
                Name = "Duplicate Category", // Same name
                Description = "Second category",
                Image = "https://example.com/second.jpg",
                IsActive = true,
                SortOrder = 2
            };

            var response = await client.PostAsJsonAsync("/api/categories", duplicateRequest);
            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Fact]
        public async Task Post_Categories_Sets_Default_Values_When_Optional_Fields_Are_Null()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var request = new CreateCategoryRequest
            {
                Name = "Default Values Test",
                Description = "Testing default values",
                Image = "https://example.com/default.jpg"
                // IsActive and SortOrder are null
            };

            var response = await client.PostAsJsonAsync("/api/categories", request);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var body = await response.Content.ReadFromJsonAsync<CategoryResponse>();
            body.Should().NotBeNull();
            body!.IsActive.Should().BeTrue(); // Default value
            body.SortOrder.Should().Be(0); // Default value
        }

        #endregion

        #region PUT Tests

        [Fact]
        public async Task Put_Category_Updates_Existing_Category()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            // Create a category first
            var createRequest = new CreateCategoryRequest
            {
                Name = "Original Name",
                Description = "Original description",
                Image = "https://example.com/original.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var createResponse = await client.PostAsJsonAsync("/api/categories", createRequest);
            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();

            // Update the category
            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Updated Name",
                Description = "Updated description",
                Image = "https://example.com/updated.jpg",
                IsActive = false,
                SortOrder = 5
            };

            var response = await client.PutAsJsonAsync($"/api/categories/{createdCategory!.Id}", updateRequest);
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var updatedCategory = await response.Content.ReadFromJsonAsync<CategoryResponse>();
            updatedCategory.Should().NotBeNull();
            updatedCategory!.Id.Should().Be(createdCategory.Id);
            updatedCategory.Name.Should().Be(updateRequest.Name);
            updatedCategory.Description.Should().Be(updateRequest.Description);
            updatedCategory.Image.Should().Be(updateRequest.Image);
            updatedCategory.IsActive.Should().Be(updateRequest.IsActive);
            updatedCategory.SortOrder.Should().Be(updateRequest.SortOrder);
            updatedCategory.UpdatedAtUtc.Should().NotBeNull();
        }

        [Fact]
        public async Task Put_Category_Returns_NotFound_When_Category_Does_Not_Exist()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Non-existent Category",
                Description = "This should not work",
                Image = "https://example.com/nonexistent.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var response = await client.PutAsJsonAsync("/api/categories/non-existent-id", updateRequest);
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Put_Category_Returns_Conflict_When_Name_Already_Exists()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            // Create two categories
            var category1 = new CreateCategoryRequest
            {
                Name = "Category 1",
                Description = "First category",
                Image = "https://example.com/cat1.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var category2 = new CreateCategoryRequest
            {
                Name = "Category 2",
                Description = "Second category",
                Image = "https://example.com/cat2.jpg",
                IsActive = true,
                SortOrder = 2
            };

            var response1 = await client.PostAsJsonAsync("/api/categories", category1);
            var response2 = await client.PostAsJsonAsync("/api/categories", category2);

            var createdCategory1 = await response1.Content.ReadFromJsonAsync<CategoryResponse>();
            var createdCategory2 = await response2.Content.ReadFromJsonAsync<CategoryResponse>();

            // Try to update category2 with category1's name
            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Category 1", // Same as category1
                Description = "Updated description",
                Image = "https://example.com/updated.jpg",
                IsActive = true,
                SortOrder = 3
            };

            var response = await client.PutAsJsonAsync($"/api/categories/{createdCategory2!.Id}", updateRequest);
            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        #endregion

        #region DELETE Tests

        [Fact]
        public async Task Delete_Category_Removes_Existing_Category()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            // Create a category first
            var createRequest = new CreateCategoryRequest
            {
                Name = "To Be Deleted",
                Description = "This category will be deleted",
                Image = "https://example.com/delete.jpg",
                IsActive = true,
                SortOrder = 1
            };

            var createResponse = await client.PostAsJsonAsync("/api/categories", createRequest);
            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();

            // Delete the category
            var response = await client.DeleteAsync($"/api/categories/{createdCategory!.Id}");
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify it's deleted by trying to get it
            var getResponse = await client.GetAsync($"/api/categories/{createdCategory.Id}");
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task Delete_Category_Returns_NotFound_When_Category_Does_Not_Exist()
        {
            using var factory = CreateFactory();
            var client = factory.CreateClient();

            var response = await client.DeleteAsync("/api/categories/non-existent-id");
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        #endregion
    }
}
