import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './service/auth.service';
import { TokenService } from './service/token.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AuthService, 
        private tokenService: TokenService,
        private cookieService: CookieService // Inject CookieService to access cookies
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authReq = req;
        const accessToken = this.tokenService.getToken();
        const refreshToken = this.cookieService.get('refreshToken'); // Get refreshToken from cookie

        // Add access token to headers
        if (accessToken) {
            authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${accessToken}` }
            });
        }

        // If the access token has expired and the refresh token is present, try refreshing the token
        return next.handle(authReq).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401 && refreshToken) {
                    return this.handle401Error(req, next, refreshToken); // Pass refreshToken to handle refresh
                }
                return throwError(error);
            })
        );
    }

    private handle401Error(req: HttpRequest<any>, next: HttpHandler, refreshToken: string) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            // Call the refresh token API and handle the response
            return this.authService.refreshAccessToken().pipe(
                switchMap(response => {
                    this.isRefreshing = false;
                    if (response && response.accessToken) {
                        // Save the new accessToken to localStorage
                        localStorage.setItem('accessToken', response.accessToken); // Store the new access token

                        // Optionally store it in TokenService or state
                        this.tokenService.setToken(response.accessToken);

                        // Push the new token into the refreshTokenSubject to retry the failed request
                        this.refreshTokenSubject.next(response.accessToken);
                        
                        // Retry the failed request with the new access token
                        return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } }));
                    } else {
                        this.authService.logout();
                        return throwError('Refresh token đã hết hạn');
                    }
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
                })
            );
        }
    }
}
