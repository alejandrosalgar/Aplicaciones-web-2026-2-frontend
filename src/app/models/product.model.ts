export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  cost: number | string;
  stock: number;
  available: boolean;
  image_url: string | null;
  brand: string | null;
}

export interface ProductCreate {
  name: string;
  description: string;
  category: string;
  sku: string;
  cost: number;
  stock: number;
  available: boolean;
  image_url: string | null;
  brand: string | null;
}

export type ProductUpdate = ProductCreate;
