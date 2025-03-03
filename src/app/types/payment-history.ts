export interface PaymentHistory {
    historyId: number;
    paymentId: number;
    orderId: number;
    orderStatus: string;
    amount: number;
    transactionCode: string;
    paymentMethod: string;
    status: string;
    note: string;
    createdAt: string;
  }
  