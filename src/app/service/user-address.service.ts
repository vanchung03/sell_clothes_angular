import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAddress } from '../types/user-address';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {
  // Gán biến chứa các URL cho User Addresses từ environment
  private USER_ADDRESSES_URLS = environment.API_URLS.USER_ADDRESSES;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Lấy danh sách địa chỉ theo userId
  getAddressesByUserId(userId: number): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(
      this.USER_ADDRESSES_URLS.GET_ALL_BY_USER(userId),
      { headers: this.getAuthHeaders() }
    );
  }

  // Lấy 1 địa chỉ theo addressId
  getAddressById(addressId: number): Observable<UserAddress> {
    return this.http.get<UserAddress>(
      this.USER_ADDRESSES_URLS.GET_BY_ID(addressId),
      { headers: this.getAuthHeaders() }
    );
  }

  // Tạo mới địa chỉ
  createAddress(address: UserAddress): Observable<UserAddress> {
    return this.http.post<UserAddress>(
      this.USER_ADDRESSES_URLS.CREATE,
      address,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cập nhật địa chỉ
  updateAddress(addressId: number, address: UserAddress): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      this.USER_ADDRESSES_URLS.UPDATE(addressId),
      address,
      { headers: this.getAuthHeaders() }
    );
  }

  // Xóa địa chỉ
  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(
      this.USER_ADDRESSES_URLS.DELETE(addressId),
      { headers: this.getAuthHeaders() }
    );
  }
}
