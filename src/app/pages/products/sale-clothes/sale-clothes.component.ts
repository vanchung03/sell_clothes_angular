import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { FavoriteService } from 'src/app/service/favorite.service';
import { Product } from 'src/app/types/products';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/service/token.service';
import { ToastrService } from 'ngx-toastr';
import AOS from 'aos';

@Component({
  selector: 'app-sale-clothes',
  templateUrl: './sale-clothes.component.html',
  styleUrls: ['./sale-clothes.component.scss'],
})
export class SaleClothesComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  quickViewProductId: number = 0;
  userId: number | null = null;
  isLoading: boolean = true;
  activeFilter: string = 'newest';

  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private tokenService: TokenService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    this.loadProducts();
    
    // Initialize AOS animation library
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        once: false,
        mirror: true
      });
    }
  }

  // 🟢 Điều hướng sang trang chi tiết sản phẩm
  onViewDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }

  // 🟢 Mở xem nhanh sản phẩm
  openQuickView(productId: number) {
    this.quickViewProductId = productId;
  }

  // 🟢 Lấy danh sách sản phẩm từ API
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data.map((product) => ({
          ...product,
          isFavorite: false,
          discount: product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0,
        }));
        
        // Default sort by newest
        this.sortBy('newest');
        
        if (this.userId) {
          this.loadUserFavorites();
        }
        
        this.isLoading = false;
        
        // Refresh AOS animations after data is loaded
        setTimeout(() => {
          if (typeof AOS !== 'undefined') {
            AOS.refresh();
          }
        }, 100);
      },
      (error) => {
        this.toastr.error('Lỗi khi tải sản phẩm!', 'Lỗi');
        console.error('Lỗi khi tải sản phẩm:', error);
        this.isLoading = false;
      }
    );
  }

  // 🟢 Tải danh sách sản phẩm yêu thích của user
  loadUserFavorites() {
    this.favoriteService.getUserFavorites().subscribe(
      (favorites) => {
        this.products.forEach((product) => {
          product.isFavorite = favorites.some((fav) => fav.productId === product.productId);
        });
        this.filteredProducts = [...this.products];
      },
      (error) => console.error('Lỗi khi tải danh sách yêu thích:', error)
    );
  }

  // 🟢 Thêm/Xóa yêu thích + Thông báo Toastr
  toggleFavorite(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!this.userId) {
      this.toastr.warning('Bạn cần đăng nhập để yêu thích sản phẩm!', 'Cảnh báo');
      return;
    }

    if (product.isFavorite) {
      this.favoriteService.removeFavorite(product.productId).subscribe(
        () => {
          product.isFavorite = false;
          this.toastr.info(`Đã xóa "${product.name}" khỏi yêu thích!`, 'Thông báo');
        },
        (error) => {
          this.toastr.error('Lỗi khi xóa yêu thích!', 'Lỗi');
          console.error('Lỗi khi xóa yêu thích:', error);
        }
      );
    } else {
      this.favoriteService.addFavorite(product.productId).subscribe(
        () => {
          product.isFavorite = true;
          this.toastr.success(`Đã thêm "${product.name}" vào yêu thích!`, 'Thành công');
        },
        (error) => {
          this.toastr.error('Lỗi khi thêm yêu thích!', 'Lỗi');
          console.error('Lỗi khi thêm yêu thích:', error);
        }
      );
    }
  }

  // 🟢 Sắp xếp sản phẩm theo tiêu chí
  sortBy(type: string): void {
    this.activeFilter = type;
    
    switch (type) {
      case 'name-asc':
        this.filteredProducts = [...this.products].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts = [...this.products].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        this.filteredProducts = [...this.products].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        this.filteredProducts = [...this.products].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        this.filteredProducts = [...this.products].sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        break;
    }
    
    // Refresh AOS animations after sorting
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    }, 100);
  }
}