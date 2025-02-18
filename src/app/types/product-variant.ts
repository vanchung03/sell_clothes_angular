export interface ProductVariant {
    variantId?: number;
    productId: number;
    size?: string;
    color?: string;
    sku?: string;
    price?: number;
    stockQuantity?: number;
    imageUrl?: string;
    status?: boolean;
  }
  