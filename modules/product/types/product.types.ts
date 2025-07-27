
export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}