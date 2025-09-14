import type { Product, Category, ProductData } from "../types/product";
import productsData from "../data/products.json";

class ProductService {
  private data: ProductData;

  constructor() {
    this.data = productsData as unknown as ProductData;
  }

  // Get all products
  getAllProducts(): Product[] {
    return this.data.products;
  }

  // Get product by ID
  getProductById(id: string): Product | undefined {
    return this.data.products.find((product) => product.id === id);
  }

  // Get products by category
  getProductsByCategory(categoryId: string): Product[] {
    return this.data.products.filter(
      (product) => product.category === categoryId
    );
  }

  // Get products by subcategory
  getProductsBySubcategory(subcategoryId: string): Product[] {
    return this.data.products.filter(
      (product) => product.subcategory === subcategoryId
    );
  }

  // Get featured products
  getFeaturedProducts(): Product[] {
    return this.data.featuredProducts
      .map((id) => this.getProductById(id))
      .filter((product): product is Product => product !== undefined);
  }

  // Get best sellers
  getBestSellers(): Product[] {
    return this.data.bestSellers
      .map((id) => this.getProductById(id))
      .filter((product): product is Product => product !== undefined);
  }

  // Get new arrivals
  getNewArrivals(): Product[] {
    return this.data.newArrivals
      .map((id) => this.getProductById(id))
      .filter((product): product is Product => product !== undefined);
  }

  // Get sale products
  getSaleProducts(): Product[] {
    return this.data.saleProducts
      .map((id) => this.getProductById(id))
      .filter((product): product is Product => product !== undefined);
  }

  // Get all categories
  getCategories(): Category[] {
    return this.data.categories;
  }

  // Get category by ID
  getCategoryById(id: string): Category | undefined {
    return this.data.categories.find((category) => category.id === id);
  }

  // Search products
  searchProducts(query: string): Product[] {
    const lowercaseQuery = query.toLowerCase();
    return this.data.products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.brand.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        product.subcategory.toLowerCase().includes(lowercaseQuery) ||
        product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get products with filters
  getFilteredProducts(filters: {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    inStock?: boolean;
    tags?: string[];
  }): Product[] {
    let filteredProducts = this.data.products;

    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === filters.category
      );
    }

    if (filters.subcategory) {
      filteredProducts = filteredProducts.filter(
        (p) => p.subcategory === filters.subcategory
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.price <= filters.maxPrice!
      );
    }

    if (filters.brand) {
      filteredProducts = filteredProducts.filter(
        (p) => p.brand === filters.brand
      );
    }

    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.inStock === filters.inStock
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    return filteredProducts;
  }

  // Get related products (same category, different product)
  getRelatedProducts(productId: string, limit: number = 4): Product[] {
    const product = this.getProductById(productId);
    if (!product) return [];

    return this.data.products
      .filter((p) => p.id !== productId && p.category === product.category)
      .slice(0, limit);
  }

  // Get product suggestions for search
  getSearchSuggestions(query: string, limit: number = 6): Product[] {
    if (!query.trim()) return [];

    const results = this.searchProducts(query);
    return results.slice(0, limit);
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
