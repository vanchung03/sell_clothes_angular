import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  step: number = 1;
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  newPasswordForm: FormGroup;
  email: string = ''; // Lưu email để sử dụng trong các bước tiếp theo
  wrongOtpCount: number = 0; // Số lần nhập sai OTP

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Bước 1: Nhập email
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Bước 2: Nhập OTP
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    // Bước 3: Nhập mật khẩu mới
    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  goBack() {
    if (this.step > 1) {
      this.step--;
    }
  }
  

  // 📨 Gửi OTP qua email
  sendOTP() {
    if (this.forgotPasswordForm.invalid) return;
    this.email = this.forgotPasswordForm.value.email;

    this.authService.requestOTP(this.email).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success('OTP đã được gửi đến email của bạn!', 'Thành công');
          this.step = 2;  // Chuyển sang bước nhập OTP
          this.wrongOtpCount = 0; // Reset số lần nhập sai OTP
        } else {
          this.toastr.error(response.message || 'Lỗi không xác định!', 'Lỗi');
        }
      },
      (error) => {
        this.toastr.error('Lỗi khi gửi OTP. Vui lòng thử lại.', 'Lỗi');
      }
    );
  }

  // ✅ Xác nhận OTP
  verifyOTP() {
    if (this.otpForm.invalid) return;
    const otp = this.otpForm.value.otp;

    this.authService.verifyOTP(this.email, otp).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success('OTP hợp lệ, vui lòng nhập mật khẩu mới!', 'Thành công');
          this.step = 3; // Chuyển sang bước nhập mật khẩu mới
          this.wrongOtpCount = 0; // Reset số lần nhập sai OTP
        } else {
          this.wrongOtpCount++; // Tăng số lần nhập sai OTP
          console.log('Số lần nhập sai OTP:', this.wrongOtpCount); // Debug

          if (this.wrongOtpCount >= 3) {
            this.toastr.error('Bạn đã nhập sai OTP quá 3 lần. Vui lòng yêu cầu OTP mới.', 'Lỗi');
            this.step = 1; // Quay lại bước nhập email
            this.otpForm.reset(); // Reset form OTP
            this.wrongOtpCount = 0; // Reset số lần nhập sai
          } else {
            this.toastr.error(response.message || 'OTP không đúng. Vui lòng thử lại.', 'Lỗi');
          }
        }
      },
      (error) => {
        this.toastr.error('OTP không đúng. Vui lòng thử lại.', 'Lỗi');
      }
    );
  }

  // 🔑 Đặt lại mật khẩu mới
  resetPassword() {
    if (this.newPasswordForm.invalid) return;
    const { newPassword, confirmPassword } = this.newPasswordForm.value;

    if (newPassword !== confirmPassword) {
      this.toastr.warning('Mật khẩu xác nhận không khớp.', 'Cảnh báo');
      return;
    }

    this.authService.resetPassword(this.email, this.otpForm.value.otp, newPassword).subscribe(
      (response) => {
        if (response.success) {
          this.toastr.success('Mật khẩu đã được đặt lại thành công!', 'Thành công');
          this.router.navigate(['/auth/login']); // Chuyển hướng đến trang đăng nhập
        } else {
          this.toastr.error(response.message || 'Lỗi khi đặt lại mật khẩu.', 'Lỗi');
        }
      },
      (error) => {
        this.toastr.error('Lỗi khi đặt lại mật khẩu.', 'Lỗi');
      }
    );
  }
}
