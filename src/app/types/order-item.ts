import { ProductVariant } from "./product-variant";
export interface OrderItem {
    orderId: number;
    variantId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variant?: ProductVariant;
}
  
  