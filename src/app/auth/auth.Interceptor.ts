import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1) Bỏ qua interceptor nếu request là /login hoặc /refresh
    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
      return next.handle(req);
    }

    // 2) Lấy token
    const token = this.tokenService.getToken();
    // if (token) {
    //   // Nếu có token => chèn vào header
    //   req = this.addTokenHeader(req, token);
    // }

    // 3) Xử lý response
    return next.handle(req).pipe(
      catchError((error) => {
        // Nếu 401 => có thể token hết hạn => refresh
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.warn('Lỗi 401 - Token có thể đã hết hạn hoặc sai.');
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Bắt lỗi 401 => refresh token => retry request
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      // Set refreshTokenSubject = null để các request tiếp theo chờ
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((newToken: string | null) => {
          this.isRefreshing = false;
          if (!newToken) {
            // Nếu không refresh được => logout
            console.error('Không thể làm mới token. Đăng xuất.');
            this.authService.logout();
            return throwError(() => new Error('Không thể xác thực.'));
          }
          // Lưu token
          this.tokenService.saveToken(newToken);
          // Thông báo cho các request đang chờ
          this.refreshTokenSubject.next(newToken);
          // Retry request cũ với token mới
          return next.handle(this.addTokenHeader(request, newToken));
        }),
        catchError((refreshError) => {
          console.error('Lỗi khi làm mới token:', refreshError);
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => new Error('Không thể xác thực.'));
        })
      );
    } else {
      // Đang refresh => các request khác chờ token mới
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          // Retry request cũ
          return next.handle(this.addTokenHeader(request, token!));
        })
      );
    }
  }

  /**
   * Helper: chèn header Authorization
   */
  private addTokenHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
}
