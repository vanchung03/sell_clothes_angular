import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenService } from '../service/token.service';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private tokenService: TokenService, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // ✅ Bỏ qua interceptor nếu request là đăng nhập hoặc refresh token để tránh lỗi vòng lặp
        if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
            return next.handle(req);
        }

        let token = this.tokenService.getToken();
        let refreshToken = this.tokenService.getRefreshToken();

        // ✅ Nếu chưa có accessToken & refreshToken => Không can thiệp request (Tránh lỗi đăng nhập lần đầu)
        if (!token && !refreshToken) {
            return next.handle(req);
        }

        // ✅ Nếu không có accessToken nhưng có refreshToken => Làm mới token trước khi gửi request
        if (!token && refreshToken) {
            console.warn('Không có accessToken! Đang làm mới...');
            return this.authService.refreshAccessToken().pipe(
                switchMap((newToken: string | null) => {
                    if (newToken) {
                        console.info('Làm mới accessToken thành công:', newToken);
                        this.tokenService.saveToken(newToken);
                        const clonedReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` },
                        });
                        return next.handle(clonedReq);
                    } else {
                        console.error('Không thể làm mới accessToken. Đăng xuất.');
                        this.authService.logout();
                        return throwError(() => new Error('Không thể xác thực.'));
                    }
                }),
                catchError((refreshError) => {
                    console.error('Lỗi khi làm mới token:', refreshError);
                    this.authService.logout();
                    return throwError(() => new Error('Không thể xác thực.'));
                })
            );
        }

        // ✅ Nếu token hợp lệ, thêm vào request
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.warn('Lỗi 401 - Token có thể đã hết hạn hoặc sai.');
                    return this.authService.refreshAccessToken().pipe(
                        switchMap((newToken: string | null) => {
                            if (newToken) {
                                this.tokenService.saveToken(newToken);
                                const clonedReq = req.clone({
                                    setHeaders: { Authorization: `Bearer ${newToken}` },
                                });
                                return next.handle(clonedReq);
                            } else {
                                console.error('Không thể làm mới token. Đăng xuất.');
                                this.authService.logout();
                                return throwError(() => new Error('Không thể xác thực.'));
                            }
                        }),
                        catchError((refreshError) => {
                            console.error('Lỗi khi làm mới token:', refreshError);
                            this.authService.logout();
                            return throwError(() => new Error('Không thể xác thực.'));
                        })
                    );
                }
                return throwError(() => error);
            })
        );
    }
}
