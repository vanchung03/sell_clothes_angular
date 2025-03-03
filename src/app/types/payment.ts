export interface Payment {
  paymentId: number;
  orderId: number;
  method: string;
  amount: number;
  transactionCode?: string;
  paymentStatus: string;
  createdAt: string; // ✅ Luôn là string
  updatedAt: string;
}
