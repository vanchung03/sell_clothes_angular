import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private apiUrl = 'http://localhost:8080/api/cloudinary';

  constructor(private http: HttpClient) {}

  // Lấy token từ localStorage (hoặc từ 1 tokenService)
  private getAuthHeadersWithoutContentType(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
      // KHÔNG set Content-Type thủ công, để HttpClient tự set với FormData
    });
  }

  // Gửi file lên API /upload-product, nhận về URL
  uploadProductImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);  // key = "file" vì server @RequestParam("file")

    return this.http.post<any>(
      `${this.apiUrl}/upload-product`,
      formData,
      { headers: this.getAuthHeadersWithoutContentType() }
    );
  }
}
