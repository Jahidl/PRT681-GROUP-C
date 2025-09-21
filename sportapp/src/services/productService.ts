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

  // Get subcategories for a category
  getSubcategories(
    categoryId: string
  ): { id: string; name: string; description: string }[] {
    const category = this.getCategoryById(categoryId);
    return category?.subcategories || [];
  }

  // Add new product (in-memory only - for demo purposes)
  addProduct(product: Product): Product {
    // Check if product ID already exists
    if (this.getProductById(product.id)) {
      throw new Error(`Product with ID '${product.id}' already exists`);
    }

    // Validate required fields
    if (!product.id || !product.name || !product.category) {
      throw new Error("Product ID, name, and category are required");
    }

    // Add to products array
    this.data.products.push(product);

    return product;
  }

  // Add new category (in-memory only - for demo purposes)
  addCategory(category: Category): Category {
    // Check if category ID already exists
    if (this.getCategoryById(category.id)) {
      throw new Error(`Category with ID '${category.id}' already exists`);
    }

    // Validate required fields
    if (!category.id || !category.name) {
      throw new Error("Category ID and name are required");
    }

    // Add to categories array
    this.data.categories.push(category);

    return category;
  }

  // Update product (in-memory only - for demo purposes)
  updateProduct(productId: string, updates: Partial<Product>): Product {
    const productIndex = this.data.products.findIndex(
      (p) => p.id === productId
    );
    if (productIndex === -1) {
      throw new Error(`Product with ID '${productId}' not found`);
    }

    // Update the product
    this.data.products[productIndex] = {
      ...this.data.products[productIndex],
      ...updates,
    };

    return this.data.products[productIndex];
  }

  // Delete product (in-memory only - for demo purposes)
  deleteProduct(productId: string): boolean {
    const productIndex = this.data.products.findIndex(
      (p) => p.id === productId
    );
    if (productIndex === -1) {
      return false;
    }

    this.data.products.splice(productIndex, 1);

    // Remove from featured/bestsellers/etc arrays if present
    this.data.featuredProducts = this.data.featuredProducts.filter(
      (id) => id !== productId
    );
    this.data.bestSellers = this.data.bestSellers.filter(
      (id) => id !== productId
    );
    this.data.newArrivals = this.data.newArrivals.filter(
      (id) => id !== productId
    );
    this.data.saleProducts = this.data.saleProducts.filter(
      (id) => id !== productId
    );

    return true;
  }

  // Delete category (in-memory only - for demo purposes)
  deleteCategory(categoryId: string): boolean {
    const categoryIndex = this.data.categories.findIndex(
      (c) => c.id === categoryId
    );
    if (categoryIndex === -1) {
      return false;
    }

    // Check if any products use this category
    const productsInCategory = this.getProductsByCategory(categoryId);
    if (productsInCategory.length > 0) {
      throw new Error(
        `Cannot delete category '${categoryId}' because it contains ${productsInCategory.length} products`
      );
    }

    this.data.categories.splice(categoryIndex, 1);
    return true;
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
