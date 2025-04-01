import { UserAddress } from "./user-address";
import { OrderItem } from "./order-item";
import { Payment } from "./payment";
import { User } from "./User";
import { ShipMethod } from "./ship-method"; 

export interface Order {
  orderId: number;
  userId: number;
  user?: User;
  addressId: number;
  address?: UserAddress;
  shipMethodId: number;
  shipMethod?: ShipMethod;
  orderItems?: OrderItem[];
  totalAmount: number;
  status: string;
  voucherCode?: string; // ✅ Thêm voucherCode
  discountAmount?: number; // ✅ Thêm số tiền giảm giá từ voucher
  createdAt: string | Date;
  updatedAt: string;
}
