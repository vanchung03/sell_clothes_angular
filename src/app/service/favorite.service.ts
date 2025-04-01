import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { TokenService } from './token.service';

// Interface mô tả dữ liệu FavoriteProduct
export interface FavoriteProduct {
  favoriteId?: number;
  userId: number;
  productId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoriteUrl = environment.API_URLS.FAVORITES.BASE;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // Lấy header với token từ localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Thêm sản phẩm yêu thích
  addFavorite(productId: number): Observable<FavoriteProduct> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      throw new Error('User ID không tồn tại!');
    }

    const url = environment.API_URLS.FAVORITES.ADD(userId, productId);
    const headers = this.getAuthHeaders();
    return this.http.post<FavoriteProduct>(url, null, { headers });
  }

  removeFavorite(productId: number): Observable<any> {
    const url = environment.API_URLS.FAVORITES.REMOVE(this.tokenService.getUserId()!, productId);
    const headers = this.getAuthHeaders();
    return this.http.delete(url, { headers, responseType: 'text' }); // 🟢 Thêm responseType: 'text'
  }
  

  // Lấy danh sách sản phẩm yêu thích của user từ token
  getUserFavorites(): Observable<FavoriteProduct[]> {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      throw new Error('User ID không tồn tại!');
    }

    const url = environment.API_URLS.FAVORITES.GET_USER_FAVORITES(userId);
    const headers = this.getAuthHeaders();
    return this.http.get<FavoriteProduct[]>(url, { headers });
  }
}
