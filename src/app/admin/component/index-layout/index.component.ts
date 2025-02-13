import { Component, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../service/user.service';
import { Role } from 'src/app/types/roles';
import { User } from 'src/app/types/User';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class AdminLayoutComponent {
  user:any; // Đối tượng người dùng
  isEditing: boolean = false;
  showMenu = false;
  isProfileFormVisible = false;  // Dùng để điều khiển việc hiển thị form
  userRoles: string = '';
  constructor(private router: Router, private renderer: Renderer2, private userService: UserService, private toastr: ToastrService) { }
  // Hàm lấy thông tin người dùng
  // Lấy thông tin người dùng
  profile(): void {
    this.userService.getUserById().subscribe(
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
      avatar: this.user.avatar ? this.user.avatar.substring(0, 255) : null,
    };
  // Nếu người dùng nhập mật khẩu mới thì thêm vào object update
  if (this.user.newPassword && this.user.newPassword.trim() !== '') {
    updatedUser.passwordHash = this.user.newPassword;
  }
    this.userService.updateUser(updatedUser).subscribe(
      (response) => {
        console.log('User updated successfully:', response);
        this.toastr.success('Cập nhật người dùng thành công!', 'Thành công');
        this.isEditing = false;
        this.profile(); // Load lại thông tin sau khi cập nhật
      },
      (error) => {
        console.error('Error updating user:', error);
        this.toastr.error('Đã xảy ra lỗi khi cập nhật người dùng.', 'Lỗi');
      }
    );
  }
  

  toggleProfileForm() {
    this.isProfileFormVisible = !this.isProfileFormVisible; // Hiện/ẩn form
    this.profile();
  }
  // Khi nhấn nút "Edit"
  startEditing(): void {
    this.isEditing = true;
  }

  isDarkMode = false; // Trạng thái chế độ sáng/tối
  dataSource: any;
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  clearSearch(inputElement: HTMLInputElement) {
    inputElement.value = ''; // Xóa nội dung trong ô nhập
    this.applyFilter({ target: inputElement } as unknown as Event); // Áp dụng bộ lọc với giá trị trống
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const body = document.body;
    if (this.isDarkMode) {
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    } else {
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    }
  }


  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }

  @ViewChild('fileInput') fileInput: any;
  // Open file input dialog
  editAvatar() {
    const fileInput = this.fileInput.nativeElement;
    fileInput.click();  // Trigger the file input click event programmatically
  }
  // Handle file selection
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      // Convert the selected file to base64 or URL for displaying
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.user.avatar = reader.result as string;
      };
    }
  }
}
