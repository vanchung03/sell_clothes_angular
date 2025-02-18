import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  userForm: FormGroup;
  avatarPreview: string | null = null;
  avatarUrl: string | null = null;
  isUploading: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService,
    private toastr: ToastrService 
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern("^0\\d{9}$")]],
      fullName: ['', Validators.required],
      avatar: ['']
    });
  }

  // ✅ Kích hoạt chọn file ảnh khi click vào avatar
  triggerFileInput() {
    document.getElementById('avatar')?.click();
  }

  // ✅ Xử lý khi chọn file ảnh
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return; // Nếu không có file, dừng ngay

    this.isUploading = true;
    const formData = new FormData();
    formData.append("file", file);

    // Hiển thị ảnh ngay lập tức trước khi upload
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Gửi ảnh lên server
    this.userService.uploadAvatar(formData).subscribe(
      (res) => {
        if (res.success) {
          this.avatarUrl = res.imageUrl;
          this.userForm.patchValue({ avatar: res.imageUrl });
          this.toastr.success('Ảnh đã được tải lên!', 'Thành công');
        } else {
          this.toastr.error('Không thể tải ảnh lên!', 'Lỗi');
        }
        this.isUploading = false;
      },
      (err) => {
        this.toastr.error('Lỗi khi tải ảnh!', 'Lỗi');
        this.isUploading = false;
      }
    );
  }

  // ✅ Gửi dữ liệu User lên Backend
  onSubmit() {
    if (this.userForm.invalid) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin hợp lệ!', 'Cảnh báo');
      return;
    }

    this.isSubmitting = true;
    this.userService.addUser(this.userForm.value).subscribe(
      (res) => {
        this.toastr.success('Thêm người dùng thành công!', 'Thành công');
        this.resetForm(); // Xóa dữ liệu sau khi thêm thành công
      },
      (err) => {
        this.toastr.error(err.error.error || 'Lỗi khi thêm người dùng!', 'Lỗi');
        this.isSubmitting = false;
      }
    );
  }
  // ✅ Reset Form
  resetForm() {
    this.userForm.reset();
    this.avatarPreview = null;
    this.avatarUrl = null;
    this.isSubmitting = false;
  }
}
