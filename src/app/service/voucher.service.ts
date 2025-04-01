import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Voucher } from '../types/voucher';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private API_URL = environment.API_URLS.VOUCHER;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`, // ✅ Gửi token kèm API request
      'Content-Type': 'application/json'
    });
  }

  // ✅ Gọi API kèm token
  getVoucherByCode(voucherCode: string): Observable<Voucher> {
    const apiUrl = this.API_URL.GET_BY_CODE(voucherCode);
    // console.log("📢 Gọi API Voucher:", apiUrl); // ✅ Debug API URL
    return this.http.get<Voucher>(apiUrl, { headers: this.getAuthHeaders() });
  }
  // ✅ Lấy voucher theo mã voucherCode
  getAllVouchers(): Observable<Voucher[]> {
    const apiUrl = this.API_URL.GET_ALL;
    return this.http.get<Voucher[]>(apiUrl, { headers: this.getAuthHeaders() });
  }

  // ✅ Tạo mới voucher
  createVoucher(voucher: Voucher): Observable<Voucher> {
    const apiUrl = this.API_URL.CREATE;
    // console.log("📢 Gọi API: CREATE ->", apiUrl, "Data:", voucher);
    return this.http.post<Voucher>(apiUrl, voucher, { headers: this.getAuthHeaders() });
  }

  // ✅ Cập nhật thông tin voucher
  updateVoucher(voucherId: number, voucher: Voucher): Observable<Voucher> {
    const apiUrl = this.API_URL.UPDATE(voucherId);
    // console.log("📢 Gọi API: UPDATE ->", apiUrl, "Data:", voucher);
    return this.http.put<Voucher>(apiUrl, voucher, { headers: this.getAuthHeaders() });
  }
  

  // ✅ Xóa voucher theo ID
  deleteVoucher(voucherId: number): Observable<void> {
    const apiUrl = this.API_URL.DELETE(voucherId);
    // console.log("📢 Gọi API: DELETE ->", apiUrl);
    return this.http.delete<void>(apiUrl, { headers: this.getAuthHeaders() });
  }
}
