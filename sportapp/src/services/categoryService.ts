import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";

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
}
