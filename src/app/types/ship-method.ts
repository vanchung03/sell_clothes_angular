export interface ShipMethod {
  ship_method_id: number;  // ✅ Giữ nguyên theo API trả về
  name: string;
  description: string;
  shippingFee: number;
}
