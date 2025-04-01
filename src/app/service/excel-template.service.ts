import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExcelTemplateService {
  private TEMPLATE_URLS = environment.API_URLS.PRODUCTS;

  constructor(private http: HttpClient) {}

  // ✅ Hàm lấy headers có token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * ✅ Gọi API tải file Excel template cho sản phẩm
   */
  downloadProductTemplate(): Observable<Blob> {
    return this.http.get(`${this.TEMPLATE_URLS.TEMPLATE}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob', 
    });
  }
}
