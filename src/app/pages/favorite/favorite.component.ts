import { Component, OnInit } from '@angular/core';
import { FavoriteService } from 'src/app/service/favorite.service';
import { ProductService } from 'src/app/service/product.service';
import { CartService } from 'src/app/service/cart.service';
import { Product } from 'src/app/types/products';
import { TokenService } from 'src/app/service/token.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as AOS from 'aos';
import { ProductVariantService } from 'src/app/service/product-variant.service';

@Component({
  selector: 'app-favorite-products',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  favoriteProducts: Product[] = [];
  userId: number | null = null;
  isLoading: boolean = true;

  constructor(
    private favoriteService: FavoriteService,
    private productService: ProductService,
    private cartService: CartService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Khởi tạo AOS (Animate On Scroll)
    AOS.init({
      once: true,
      offset: 100,
      easing: 'ease-in-out'
    });

    this.userId = this.tokenService.getUserId();
    if (this.userId) {
      this.loadFavoriteProducts();
    } else {
      this.isLoading = false;
      this.toastr.warning('Vui lòng đăng nhập để xem danh sách yêu thích của bạn', 'Chú ý');
    }
  }

  // Lấy danh sách sản phẩm yêu thích từ API
  loadFavoriteProducts(): void {
    this.isLoading = true;
    this.favoriteService.getUserFavorites().subscribe(
      (favorites) => {
        const productIds = favorites.map((fav) => fav.productId);
        if (productIds.length === 0) {
          this.isLoading = false;
          return;
        }

        this.productService.getProductsByIds(productIds).subscribe(
          (products) => {
            this.favoriteProducts = products;
            this.isLoading = false;
          },
          (error) => {
            this.handleError('Lỗi khi tải sản phẩm yêu thích!', error);
            this.isLoading = false;
          }
        );
      },
      (error) => {
        this.handleError('Lỗi khi tải danh sách yêu thích', error);
        this.isLoading = false;
      }
    );
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  removeFavorite(productId: number): void {
    this.favoriteService.removeFavorite(productId).subscribe(
      () => {
        this.favoriteProducts = this.favoriteProducts.filter((product) => product.productId !== productId);
        this.toastr.success('Đã xóa sản phẩm khỏi danh sách yêu thích!', 'Thành công');
        
        // Áp dụng animation cho các phần tử còn lại
        setTimeout(() => {
          AOS.refresh();
        }, 300);
      },
      (error) => {
        this.handleError('Lỗi khi xóa sản phẩm yêu thích', error);
      }
    );
  }

  // Điều hướng sang trang chi tiết sản phẩm
  viewProductDetail(productId: number): void {
    this.router.navigate(['/product-detail', productId]);
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(product: Product): void {
    if (!product) return;

    // Kiểm tra variant (có thể cập nhật theo yêu cầu cụ thể)
    const variantId = ProductVariantService[0]?.variantId;
    
    if (variantId) {
      this.cartService.addItemToCart(variantId, 1).subscribe(
        () => {
          this.toastr.success(`Đã thêm "${product.name}" vào giỏ hàng!`, 'Thành công');
        },
        (error) => {
          this.handleError('Lỗi khi thêm vào giỏ hàng', error);
        }
      );
    } else {
      // Nếu không có variant, chuyển người dùng đến trang chi tiết sản phẩm
      this.toastr.info('Vui lòng chọn biến thể sản phẩm', 'Thông báo');
      this.router.navigate(['/product-detail', product.productId]);
    }
  }

  // Điều hướng đến trang sản phẩm
  goToShop(): void {
    this.router.navigate(['/home']);
  }

  // Tính phần trăm giảm giá
  calculateDiscount(originalPrice: number, salePrice: number): number {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
    const discount = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(discount);
  }

  // Xử lý lỗi chung
  private handleError(message: string, error: any): void {
    this.toastr.error(message, 'Lỗi');
    console.error(`${message}:`, error);
  }
}