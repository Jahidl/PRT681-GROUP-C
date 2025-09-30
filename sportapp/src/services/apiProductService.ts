import type { Product } from "../types/product";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface CreateProductRequest {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  sizes?: string[];
  colors?: string[];
  isActive: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  sizes?: string[];
  colors?: string[];
  isActive: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  subcategoryId?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  images: string;
  features: string;
  specifications: string;
  tags: string;
  sizes?: string;
  colors?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  isActive: boolean;
  categoryName?: string;
  subcategoryName?: string;
}

export class ApiProductService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  static async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const products = await this.handleResponse<ProductResponse[]>(response);

    // Convert API response to frontend Product type
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.categoryId,
      subcategory: p.subcategoryId || "",
      brand: p.brand,
      rating: p.rating,
      reviewCount: p.reviewCount,
      inStock: p.inStock,
      stockCount: p.stockCount,
      images: this.parseJsonField(p.images, []),
      features: this.parseJsonField(p.features, []),
      specifications: this.parseJsonField(p.specifications, {}),
      tags: this.parseJsonField(p.tags, []),
      sizes: p.sizes ? this.parseJsonField(p.sizes, undefined) : undefined,
      colors: p.colors ? this.parseJsonField(p.colors, undefined) : undefined,
    }));
  }

  private static parseJsonField<T>(
    value: string | undefined,
    defaultValue: T
  ): T {
    if (!value) return defaultValue;

    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(
        `Failed to parse JSON field: "${value}". Using fallback logic.`
      );

      // Handle comma-separated strings as arrays
      if (Array.isArray(defaultValue)) {
        // If it looks like a comma-separated list, split it
        if (
          typeof value === "string" &&
          value.includes(",") &&
          !value.startsWith("[")
        ) {
          return value.split(",").map((item) => item.trim()) as T;
        }
        // If it's a single value, wrap it in an array
        if (typeof value === "string" && value.trim()) {
          return [value.trim()] as T;
        }
      }

      // For objects, return empty object if parsing fails
      if (typeof defaultValue === "object" && !Array.isArray(defaultValue)) {
        return {} as T;
      }

      return defaultValue;
    }
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    const product = await this.handleResponse<ProductResponse>(response);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.categoryId,
      subcategory: product.subcategoryId || "",
      brand: product.brand,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      stockCount: product.stockCount,
      images: this.parseJsonField(product.images, []),
      features: this.parseJsonField(product.features, []),
      specifications: this.parseJsonField(product.specifications, {}),
      tags: this.parseJsonField(product.tags, []),
      sizes: product.sizes
        ? this.parseJsonField(product.sizes, undefined)
        : undefined,
      colors: product.colors
        ? this.parseJsonField(product.colors, undefined)
        : undefined,
    };
  }

  static async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        stockCount: product.stockCount,
        images: product.images,
        features: product.features,
        specifications: product.specifications,
        tags: product.tags,
        sizes: product.sizes,
        colors: product.colors,
        isActive: product.isActive,
      }),
    });

    const created = await this.handleResponse<ProductResponse>(response);

    return {
      id: created.id,
      name: created.name,
      description: created.description,
      price: created.price,
      originalPrice: created.originalPrice,
      category: created.categoryId,
      subcategory: created.subcategoryId || "",
      brand: created.brand,
      rating: created.rating,
      reviewCount: created.reviewCount,
      inStock: created.inStock,
      stockCount: created.stockCount,
      images: JSON.parse(created.images || "[]"),
      features: JSON.parse(created.features || "[]"),
      specifications: JSON.parse(created.specifications || "{}"),
      tags: JSON.parse(created.tags || "[]"),
      sizes: created.sizes ? JSON.parse(created.sizes) : undefined,
      colors: created.colors ? JSON.parse(created.colors) : undefined,
    };
  }

  static async updateProduct(
    id: string,
    product: UpdateProductRequest
  ): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        stockCount: product.stockCount,
        images: product.images,
        features: product.features,
        specifications: product.specifications,
        tags: product.tags,
        sizes: product.sizes,
        colors: product.colors,
        isActive: product.isActive,
      }),
    });

    const updated = await this.handleResponse<ProductResponse>(response);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      price: updated.price,
      originalPrice: updated.originalPrice,
      category: updated.categoryId,
      subcategory: updated.subcategoryId || "",
      brand: updated.brand,
      rating: updated.rating,
      reviewCount: updated.reviewCount,
      inStock: updated.inStock,
      stockCount: updated.stockCount,
      images: JSON.parse(updated.images || "[]"),
      features: JSON.parse(updated.features || "[]"),
      specifications: JSON.parse(updated.specifications || "{}"),
      tags: JSON.parse(updated.tags || "[]"),
      sizes: updated.sizes ? JSON.parse(updated.sizes) : undefined,
      colors: updated.colors ? JSON.parse(updated.colors) : undefined,
    };
  }

  static async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  }
}
