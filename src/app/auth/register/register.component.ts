import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { RegisterRequest } from '../../types/auth/RegisterRequest';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as AOS from 'aos';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerData: RegisterRequest = new RegisterRequest();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    AOS.init(); // Kích hoạt hiệu ứng AOS
  }

  onRegister() {
    if (!this.isValidForm()) return; // Kiểm tra form trước khi gửi request

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message, 'Thành công');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(response.error, 'Lỗi');
        }
      },
      error: (error) => {
        console.error('Lỗi khi đăng ký:', error);
        this.toastr.error(error.error?.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.', 'Lỗi');
      },
    });
  }

  // ✅ Kiểm tra form trước khi gửi
  isValidForm(): boolean {
    if (!this.registerData.username || this.registerData.username.length < 6) {
      this.toastr.error('Username phải có ít nhất 6 ký tự!', 'Lỗi');
      return false;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.toastr.error('Email không hợp lệ!', 'Lỗi');
      return false;
    }

    if (!this.registerData.password || this.registerData.password.length < 6) {
      this.toastr.error('Mật khẩu phải có ít nhất 6 ký tự!', 'Lỗi');
      return false;
    }

    if (!this.isValidFullName(this.registerData.fullName)) {
      this.toastr.error('Họ và tên không hợp lệ!', 'Lỗi');
      return false;
    }

    if (!this.isValidPhoneNumber(this.registerData.phone)) {
      this.toastr.error('Số điện thoại không hợp lệ!', 'Lỗi');
      return false;
    }

    return true;
  }

  // ✅ Kiểm tra email hợp lệ
  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
  }

  // ✅ Kiểm tra họ tên không chứa ký tự đặc biệt
  isValidFullName(name: string): boolean {
    const regex = /^[a-zA-ZÀ-ỹ\s]+$/;
    return regex.test(name);
  }

  // ✅ Kiểm tra số điện thoại hợp lệ (Việt Nam)
  isValidPhoneNumber(phone: string): boolean {
    const regex = /^(0[2-9]|84[2-9])[0-9]{8}$/;
    return regex.test(phone);
  }
}
