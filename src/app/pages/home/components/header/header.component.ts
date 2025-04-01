import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { UserService } from 'src/app/service/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/types/User';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { CartService } from 'src/app/service/cart.service';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/types/products';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {



  isHidden = false;
  private lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > this.lastScrollTop) {
      // Đang cuộn xuống => ẩn header
      this.isHidden = true;
    } else {
      // Đang cuộn lên => hiện header
      this.isHidden = false;
    }

    // Giữ scrollTop để lần sau so sánh
    this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  isMobileMenuOpen = false;

  toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  isLoggedIn = false;
  user: any = {};
  isEditing: boolean = false;
  showMenu = false;
  isProfileFormVisible = false;
  userRoles: string = '';
  newAvatarSelected: boolean = false;

  @ViewChild('fileInput') fileInput: any;
  selectedFile: File | null = null;


  searchTerm: string = '';
  searchResults: Product[] = [];
  showSearchResults: boolean = false;
  allProducts: Product[] = []; // ✅ Lưu trữ danh sách tất cả sản phẩm
  // Biến hiển thị số lượng yêu thích, giỏ hàng
  favoriteCount: number = 0;
  // cartCount: number = 0;
  cartItemCount: number = 0;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private userService: UserService,
    private toastr: ToastrService,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.profile();
    this.loadCartItemCount();
    this.loadAllProducts();
  }
  loadCartItemCount() {
    this.cartService.getCartItemCount().subscribe({
      next: (count) => {
        this.cartItemCount = count;
      },
      error: (err) => console.error('Lỗi khi lấy số lượng giỏ hàng:', err),
    });
  }
  // ✅ Tải toàn bộ sản phẩm một lần
  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
      },
      error: (err) => {
        console.error('Lỗi khi tải sản phẩm:', err);
      }
    });
  }



  
  // isSearchOpen: boolean = false;
// Toggle search container
// toggleSearch(): void {
//   this.isSearchOpen = !this.isSearchOpen;
//   if (this.isSearchOpen) {
//     setTimeout(() => {
//       document.querySelector('.search-box')?.querySelector('input')?.focus();
//     }, 100);
//   } else {
//     this.showSearchResults = false;
//     this.searchTerm = '';
//   }
// }



isSearchActive: boolean = false;
toggleSearch(): void {
  this.isSearchActive = !this.isSearchActive;
  if (this.isSearchActive) {
    setTimeout(() => {
      document.querySelector('.search-container input')?.querySelector('input')?.focus();
    }, 300);
  } else {
    this.searchResults = [];
    this.searchTerm = '';
  }
}
@HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const searchButton = document.querySelector('.search-btn');
    const searchContainer = document.querySelector('.search-container-wrapper');
    
    if (
      this.isSearchActive && 
      searchContainer && 
      searchButton && 
      !searchContainer.contains(event.target as Node) && 
      !searchButton.contains(event.target as Node)
    ) {
      this.isSearchActive = false;
    }
  }

  // ✅ Ẩn kết quả khi đóng
  closeSearchResults() {
    this.showSearchResults = false;
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

  onSearch(): void {
    if (this.searchTerm.length < 3) {
      this.showSearchResults = false; // Ẩn nếu nhập dưới 3 ký tự
      return;
    }
  
    this.productService.getAllProducts().subscribe((products) => {
      this.searchResults = products.filter((p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
  
      this.showSearchResults = this.searchResults.length > 0;
    });
  }
  
  // Chuyển đến trang sản phẩm chi tiết
  goToProductDetail(productId: number): void {
    this.router.navigate(["/product-detail", productId]);
    this.showSearchResults = false; // Ẩn danh sách khi chọn sản phẩm
  }
  
  // Chuyển đến trang tìm kiếm chi tiết
  goToSearchPage(): void {
    this.router.navigate(["/search"], { queryParams: { q: this.searchTerm } });
    this.showSearchResults = false;
  }







  toggleProfileForm() {
    this.isProfileFormVisible = !this.isProfileFormVisible;
    this.profile();
  }

  logout(): void {
    this.authService.logout();
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
