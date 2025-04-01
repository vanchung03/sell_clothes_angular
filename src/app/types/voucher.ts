export interface Voucher {
    voucherId: number;
    voucherCode: string;
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    maxDiscount?: number;
    expiryDate: string | Date;
    active: boolean;
    quantity?: number;
  }
  