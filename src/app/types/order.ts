import { UserAddress } from "./user-address";
import { OrderItem } from "./order-item";
import { Payment } from "./payment";
import { User } from "./User";
export interface Order {
  orderId: number;
  userId: number;
  user?: User;  
  addressId: number;
  address?: UserAddress; 
  orderItems?: OrderItem[];  I
  totalAmount: number;
  shippingFee: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}



