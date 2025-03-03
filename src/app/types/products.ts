export interface Product {
    isFavorite: boolean;
    productId?: number;
    categoryId?: number;
    brandId?: number;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    thumbnail?: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  