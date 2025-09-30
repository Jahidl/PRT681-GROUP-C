import { apiGet, apiPost } from "./client.js";

export function getProducts(params) {
  return apiGet("/api/products", params);
}

export function createProduct(product) {
  // { name, description, price, stock, imageUrl, sku }
  return apiPost("/api/products", product);
}
