import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../service/token.service';
import { ToastrService } from 'ngx-toastr';  // Import ToastrService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService, 
    private router: Router, 
    private toastr: ToastrService  // Inject ToastrService
  ) {}

  canActivate(): boolean {
    if (this.tokenService.isTokenExpired()) {
      this.router.navigate(['/login']);
      return false;
    }

    const roles = this.tokenService.getRoles();
    const status = this.tokenService.getStatus();

    if (status !== '1') {
      console.error('Trạng thái không hợp lệ');
      this.toastr.error('Trạng thái tài khoản không hợp lệ!', 'Lỗi');
      this.router.navigate(['/login']);
      return false;
    }

    if (!roles.includes('ROLE_ADMIN')) {
      this.toastr.warning('Bạn không có quyền truy cập vào trang này!', 'Cảnh báo');  // Thông báo cảnh báo nếu không phải admin
      this.router.navigate(['/forbidden']);
      return false;
    }

    return true;
  }
}
