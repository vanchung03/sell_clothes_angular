import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private tokenService: TokenService, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token = this.tokenService.getToken();

        // ✅ Bỏ qua interceptor nếu request là refresh token để tránh vòng lặp vô hạn
        if (req.url.includes('/api/auth/refresh')) {
            return next.handle(req);
        }

        // ✅ Thêm access token vào request nếu có
        if (token) {
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
            });
        }

        return next.handle(req).pipe(
            catchError((error) => {
                console.error('Lỗi HTTP:', error);

                // Nếu lỗi 401 và có refreshToken, thử làm mới accessToken
                if (error.status == 401 && this.tokenService.getRefreshToken()) {
                    console.warn('Lỗi 401 - Đang thử làm mới access token.');

                    return this.authService.refreshAccessToken().pipe(
                        switchMap((newToken: string | null) => {
                            if (newToken) {
                                console.info('Làm mới access token thành công:', newToken);
                                
                                this.tokenService.saveToken(newToken);

                                // ✅ Clone lại request với token mới
                                const clonedReq = req.clone({
                                    setHeaders: { Authorization: `Bearer ${newToken}` },
                                });

                                return next.handle(clonedReq);
                            } else {
                                console.error('Làm mới access token thất bại. Đăng xuất.');
                                this.authService.logout();
                                return throwError(() => new Error('Chưa được xác thực.'));
                            }
                        }),
                        catchError((refreshError) => {
                            console.error('Lỗi khi làm mới token:', refreshError);
                            this.authService.logout();
                            return throwError(() => new Error('Chưa được xác thực.'));
                        })
                    );
                }

                return throwError(() => error);
            })
        );
    }
}
