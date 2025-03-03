import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAddress } from '../types/user-address';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {
  private apiUrl = 'http://localhost:8080/api/v1/user-addresses';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAddressesByUserId(userId: number): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  getAddressById(addressId: number): Observable<UserAddress> {
    return this.http.get<UserAddress>(`${this.apiUrl}/${addressId}`, { headers: this.getAuthHeaders() });
  }

  createAddress(address: UserAddress): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.apiUrl, address, { headers: this.getAuthHeaders() });
  }

  updateAddress(addressId: number, address: UserAddress): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.apiUrl}/${addressId}`, address, { headers: this.getAuthHeaders() });
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${addressId}`, { headers: this.getAuthHeaders() });
  }
}
