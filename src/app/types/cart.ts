import { CartItem } from "./cart-item";

export interface Cart {
    address: string;
    items: any;
    addressId: number;
    totalAmount: number;
    shippingFee: number;
    cartId: number;
    userId: number;
    cartItems: CartItem[];
  }
  