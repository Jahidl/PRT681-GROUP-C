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
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  sizes?: string[];
  colors?: string[];
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
      images: p.images,
      features: p.features,
      specifications: p.specifications,
      tags: p.tags,
      sizes: p.sizes,
      colors: p.colors,
    }));
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
      images: product.images,
      features: product.features,
      specifications: product.specifications,
      tags: product.tags,
      sizes: product.sizes,
      colors: product.colors,
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
      images: created.images,
      features: created.features,
      specifications: created.specifications,
      tags: created.tags,
      sizes: created.sizes,
      colors: created.colors,
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
      images: updated.images,
      features: updated.features,
      specifications: updated.specifications,
      tags: updated.tags,
      sizes: updated.sizes,
      colors: updated.colors,
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
