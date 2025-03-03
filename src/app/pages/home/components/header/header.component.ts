import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/types/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
   isLoggedIn = false;
   user:any={};
    isEditing: boolean = false;
    showMenu = false;
    isProfileFormVisible = false;
    userRoles: string = '';
    newAvatarSelected: boolean = false; 
  
    @ViewChild('fileInput') fileInput: any;
    selectedFile: File | null = null; 
  searchTerm: string = '';
  // Biến hiển thị số lượng yêu thích, giỏ hàng
  favoriteCount: number = 0;
  cartCount: number = 0;

 constructor(
    private router: Router,
    private renderer: Renderer2,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
   this.profile();
  }
  

  // Hàm xử lý khi bấm nút tìm kiếm
  onSearch(): void {
    if (this.searchTerm.trim()) {
      console.log('Search for:', this.searchTerm);
      // Bạn cũng có thể điều hướng, gọi service tìm kiếm, v.v...
    } else {
      console.log('Vui lòng nhập từ khóa tìm kiếm');
    }
  }saveChanges(): void {
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
  
  logout(): void {
    localStorage.removeItem('accessToken');
    this.isLoggedIn = false;
    this.user = {};  // Xóa thông tin user
    this.router.navigateByUrl('/login');
  }
  showOrders = false;

  myOrders() {
    this.showOrders = true;
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeOrders() {
    this.showOrders = false;
    // Restore body scrolling when modal is closed
    document.body.style.overflow = 'auto';
  }
  profile(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.isLoggedIn = false;
      return;
    }
  
    this.userService.getId_profile().subscribe({
      next: (data) => {
        this.user = { ...data };
        this.isLoggedIn = true;
        this.userRoles = this.user.roles?.map((role: { name: any }) => role.name).join(', ') || '';
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin người dùng', err);
        this.isLoggedIn = false;
      },
    });
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
  startEditing(): void {
    this.isEditing = true;
  }
  editAvatar() {
    this.fileInput.nativeElement.click();
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
