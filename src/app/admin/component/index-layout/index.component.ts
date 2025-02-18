import { Component, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/types/User';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class AdminLayoutComponent {
  user:any={};
  isEditing: boolean = false;
  showMenu = false;
  isProfileFormVisible = false;
  userRoles: string = '';
  newAvatarSelected: boolean = false; 

  @ViewChild('fileInput') fileInput: any;
  selectedFile: File | null = null; 

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.profile();
  }

  profile(): void {
    this.userService.getId_profile().subscribe(
      (data) => {
        this.user = { ...data };
        if (this.user?.roles && Array.isArray(this.user.roles)) {
          this.userRoles = this.user.roles.map((role: { name: any }) => role.name).join(', ');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng', error);
      }
    );
  }

  saveChanges(): void {
    const updatedUser: any = {
      username: this.user.username,
      email: this.user.email,
      fullName: this.user.fullName,
      phone: this.user.phone,
      avatar: this.user.avatar ? this.user.avatar.substring(0, 255) : null
    };

    if (this.user.newPassword && this.user.newPassword.trim() !== '') {
      updatedUser.passwordHash = this.user.newPassword;
    }

    this.userService.updateProfile(updatedUser).subscribe(
      (response) => {
        console.log('User updated successfully:', response);
        this.toastr.success('Cập nhật người dùng thành công!', 'Thành công');
        this.isEditing = false;
        this.profile();
      },
      (error) => {
        console.error('Lỗi khi cập nhật người dùng:', error);
        this.toastr.error('Đã xảy ra lỗi khi cập nhật người dùng.', 'Lỗi');
      }
    );
  }

  toggleProfileForm() {
    this.isProfileFormVisible = !this.isProfileFormVisible;
    this.profile();
  }

  startEditing(): void {
    this.isEditing = true;
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }

  editAvatar() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.newAvatarSelected = true; // Hiển thị nút "Lưu Avatar"

      // Xem trước ảnh
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.user.avatar = reader.result as string;
      };
    }
  }

  saveAvatar() {
    if (!this.selectedFile) {
      this.toastr.warning('Vui lòng chọn một ảnh mới trước khi lưu!', 'Cảnh báo');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', this.selectedFile);
  
    this.userService.updateAvatar_profile(formData).subscribe(
      (response) => {
        this.user.avatar = response.imageUrl;
        this.toastr.success('Cập nhật avatar thành công!', 'Thành công');
        this.newAvatarSelected = false;
      },
      (error) => {
        console.error('Lỗi khi cập nhật avatar:', error);
        this.toastr.error('Đã xảy ra lỗi khi cập nhật avatar.', 'Lỗi');
      }
    );
  }
  
}
