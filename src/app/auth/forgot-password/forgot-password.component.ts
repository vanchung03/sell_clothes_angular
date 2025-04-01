import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as AOS from 'aos';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  step: number = 1;
  forgotPasswordForm: FormGroup;
  otpForm: FormGroup;
  newPasswordForm: FormGroup;
  email: string = '';
  wrongOtpCount: number = 0;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Khởi tạo form cho từng bước
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.newPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với hiệu ứng 1000ms
  }

  goBack() {
    if (this.step > 1) {
      this.step--;
      AOS.refresh(); // Cập nhật lại hiệu ứng AOS khi chuyển bước
    }
  }

  // Gửi OTP qua email
  sendOTP() {
    if (this.forgotPasswordForm.invalid) return;
    this.email = this.forgotPasswordForm.value.email;
    this.loading = true;
    this.authService.requestOTP(this.email).subscribe(
      (response) => {
        this.loading = false;
        if (response.success) {
          this.toastr.success('OTP đã được gửi đến email của bạn!', 'Thành công');
          this.step = 2;
          this.wrongOtpCount = 0;
          AOS.refresh();
        } else {
          this.toastr.error(response.message || 'Lỗi không xác định!', 'Lỗi');
        }
      },
      (error) => {
        this.loading = false;
        this.toastr.error('Lỗi khi gửi OTP. Vui lòng thử lại.', 'Lỗi');
      }
    );
  }

  // Xác nhận OTP
  verifyOTP() {
    if (this.otpForm.invalid) return;
    const otp = this.otpForm.value.otp;
    this.loading = true;
    this.authService.verifyOTP(this.email, otp).subscribe(
      (response) => {
        this.loading = false;
        if (response.success) {
          this.toastr.success('OTP hợp lệ, vui lòng nhập mật khẩu mới!', 'Thành công');
          this.step = 3;
          this.wrongOtpCount = 0;
          AOS.refresh();
        } else {
          this.wrongOtpCount++;
          if (this.wrongOtpCount >= 3) {
            this.toastr.error('Bạn đã nhập sai OTP quá 3 lần. Vui lòng yêu cầu OTP mới.', 'Lỗi');
            this.step = 1;
            this.otpForm.reset();
            this.wrongOtpCount = 0;
            AOS.refresh();
          } else {
            this.toastr.error(response.message || 'OTP không đúng. Vui lòng thử lại.', 'Lỗi');
          }
        }
      },
      (error) => {
        this.loading = false;
        this.toastr.error('OTP không đúng. Vui lòng thử lại.', 'Lỗi');
      }
    );
  }

  // Đặt lại mật khẩu mới
  resetPassword() {
    if (this.newPasswordForm.invalid) return;
    const { newPassword, confirmPassword } = this.newPasswordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastr.warning('Mật khẩu xác nhận không khớp.', 'Cảnh báo');
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.email, this.otpForm.value.otp, newPassword).subscribe(
      (response) => {
        this.loading = false;
        if (response.success) {
          this.toastr.success('Mật khẩu đã được đặt lại thành công!', 'Thành công');
          this.router.navigate(['/auth/login']);
        } else {
          this.toastr.error(response.message || 'Lỗi khi đặt lại mật khẩu.', 'Lỗi');
        }
      },
      (error) => {
        this.loading = false;
        this.toastr.error('Lỗi khi đặt lại mật khẩu.', 'Lỗi');
      }
    );
  }
}
