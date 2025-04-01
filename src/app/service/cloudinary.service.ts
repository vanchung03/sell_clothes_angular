import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  // Lấy URL từ environment
  private CLOUDINARY_URLS = environment.API_URLS.CLOUDINARY;

  constructor(private http: HttpClient) {}

  // Lấy token từ localStorage hoặc từ 1 TokenService
  private getAuthHeadersWithoutContentType(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Không có token trong localStorage');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
      // Không set Content-Type, để HttpClient tự set với FormData
    });
  }

  // Gửi file lên API /upload-product, nhận về URL ảnh
  uploadProductImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      this.CLOUDINARY_URLS.UPLOAD_PRODUCT,
      formData,
      { headers: this.getAuthHeadersWithoutContentType() }
    );
  }

  // Gửi file lên API /upload-logo-brand, nhận về URL ảnh logo
  uploadLogoImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      this.CLOUDINARY_URLS.UPLOAD_LOGO,
      formData,
      { headers: this.getAuthHeadersWithoutContentType() }
    );
  }

  uploadFolderImages(files: FileList): Observable<any> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      console.log("📢 Đang gửi file:", file.name);
      formData.append('files', file);
    });
  
    return this.http.post<any>(
      this.CLOUDINARY_URLS.UPLOAD_FOLDER,
      formData,
      { headers: this.getAuthHeadersWithoutContentType() }
    );
  }
  
  
}
