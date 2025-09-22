export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
}
