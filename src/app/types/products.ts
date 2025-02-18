
// export interface Product {
//     productId: number;
//     categoryId: number;
//     brandId: number;
//     name: string;
//     description: string;
//     price: number;
//     salePrice: number;
//     thumbnail: string;
//     status: boolean;
//     createdAt: string;
//     updatedAt: string;
//   }
  export interface Product {
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
  