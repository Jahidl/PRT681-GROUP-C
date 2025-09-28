export interface Subcategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  categoryId: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  isActive: boolean;
  sortOrder: number;
  categoryName?: string;
  productCount?: number;
}

export interface CreateSubcategoryRequest {
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateSubcategoryRequest {
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}
