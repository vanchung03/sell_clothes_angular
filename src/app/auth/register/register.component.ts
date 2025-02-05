import { Component } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { RegisterRequest } from '../models/register-request.model';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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

  onRegister() {
    // Kiểm tra nếu có trường nào bị rỗng
    if (!this.registerData.username || !this.registerData.password || !this.registerData.fullName || !this.registerData.email) {
      this.toastr.error('Vui lòng điền đầy đủ thông tin!', 'Lỗi');
      return;
    }
    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message, 'Thành công');
          this.router.navigate(['/login']);
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
  
}
