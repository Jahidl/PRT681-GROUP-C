import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";
import type {
  Subcategory,
  CreateSubcategoryRequest,
  UpdateSubcategoryRequest,
} from "../types/subcategory";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class CategoryService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  static async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    return this.handleResponse<Category[]>(response);
  }

  static async getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
    return this.handleResponse<Category>(response);
  }

  static async createCategory(
    category: CreateCategoryRequest
  ): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    return this.handleResponse<Category>(response);
  }

  static async updateCategory(
    id: string,
    category: UpdateCategoryRequest
  ): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    });
    return this.handleResponse<Category>(response);
  }

  static async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }

  // Subcategory methods
  static async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${categoryId}/subcategories`
    );
    return this.handleResponse<Subcategory[]>(response);
  }

  static async getSubcategoryById(
    categoryId: string,
    subcategoryId: string
  ): Promise<Subcategory> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${categoryId}/subcategories/${subcategoryId}`
    );
    return this.handleResponse<Subcategory>(response);
  }

  static async createSubcategory(
    categoryId: string,
    subcategory: CreateSubcategoryRequest
  ): Promise<Subcategory> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${categoryId}/subcategories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subcategory),
      }
    );
    return this.handleResponse<Subcategory>(response);
  }

  static async updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    subcategory: UpdateSubcategoryRequest
  ): Promise<Subcategory> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${categoryId}/subcategories/${subcategoryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subcategory),
      }
    );
    return this.handleResponse<Subcategory>(response);
  }

  static async deleteSubcategory(
    categoryId: string,
    subcategoryId: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/api/categories/${categoryId}/subcategories/${subcategoryId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}
