import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../types/payment-method';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private apiUrl = 'http://localhost:8080/api/v1/payment-methods';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPaymentMethodById(id: number): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPaymentMethod(paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.apiUrl, paymentMethod, { headers: this.getAuthHeaders() });
  }

  updatePaymentMethod(id: number, paymentMethod: PaymentMethod): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/${id}`, paymentMethod, { headers: this.getAuthHeaders() });
  }

  deletePaymentMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
