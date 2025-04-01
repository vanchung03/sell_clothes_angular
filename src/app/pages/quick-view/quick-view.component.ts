import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { FavoriteService } from 'src/app/service/favorite.service';
import { CartService } from 'src/app/service/cart.service';
import { Product } from 'src/app/types/products';
import { ProductImage } from 'src/app/types/product-image';
import { ProductVariant } from 'src/app/types/product-variant';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnChanges {
  @Input() productId!: number; 
  product!: Product;
  productImages: ProductImage[] = [];
  productVariants: ProductVariant[] = [];
  uniqueColors: string[] = []; 
  uniqueSizes: string[] = []; 
  selectedImage: string = '';
  selectedColor: string = '';
  selectedSize: string = '';
  selectedVariant!: ProductVariant | null;
  quantity = 1;
  userId: number | null = null;

  constructor(
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cartService: CartService,
    private favoriteService: FavoriteService, // ✅ Thêm FavoriteService
    private toastr: ToastrService,
    private tokenService: TokenService // ✅ Lấy userId từ token
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId(); // ✅ Lấy userId từ token
  }

  // ✅ Khi `productId` thay đổi, tự động gọi lại API
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && changes['productId'].currentValue) {
      this.loadProductDetails();
    }
  }

  loadProductDetails(): void {
    if (!this.productId) return;

    this.productService.getProductById(this.productId).subscribe((data) => {
      this.product = { ...data, isFavorite: false }; // Mặc định chưa yêu thích
    });

    this.productImageService.getAllProductImages(this.productId).subscribe((data) => {
      this.productImages = data;
      this.selectedImage = this.productImages.length > 0 ? this.productImages[0].imageUrl : 'assets/images/default-product.jpg';
    });

    this.productVariantService.getAllVariantsByProductId(this.productId).subscribe((data) => {
      this.productVariants = data;

      if (this.productVariants.length > 0) {
        this.uniqueColors = Array.from(new Set(this.productVariants.map(variant => variant.color)));
        this.uniqueSizes = Array.from(new Set(this.productVariants.map(variant => variant.size)));

        this.selectedColor = this.uniqueColors[0] || '';
        this.selectedSize = this.uniqueSizes[0] || '';
        this.updateSelectedVariant();
      }
    });

    // ✅ Nếu user đã đăng nhập, kiểm tra sản phẩm đã được yêu thích chưa
    if (this.userId) {
      this.favoriteService.getUserFavorites().subscribe((favorites) => {
        this.product.isFavorite = favorites.some((fav) => fav.productId === this.productId);
      });
    }
  }

  updateSelectedVariant(): void {
    this.selectedVariant = this.productVariants.find(
      (variant) => variant.color === this.selectedColor && variant.size === this.selectedSize
    ) || null;

    if (this.selectedVariant?.imageUrl) {
      this.selectedImage = this.selectedVariant.imageUrl;
    } else {
      this.selectedImage = this.productImages.length > 0 ? this.productImages[0].imageUrl : 'assets/images/default-product.jpg';
    }
  }

  onSelectImage(img: string) {
    this.selectedImage = img;
  }

  onSelectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedVariant();
  }

  onSelectSize(size: string) {
    this.selectedSize = size;
    this.updateSelectedVariant();
  }

  onIncreaseQuantity() {
    this.quantity++;
  }

  onDecreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // ✅ Thêm/Xóa yêu thích
  toggleFavorite(): void {
    if (!this.userId) {
      this.toastr.warning('Bạn cần đăng nhập để yêu thích sản phẩm!', 'Cảnh báo');
      return;
    }

    if (this.product.isFavorite) {
      this.favoriteService.removeFavorite(this.productId).subscribe(
        () => {
          this.product.isFavorite = false;
          this.toastr.info(`Đã xóa "${this.product.name}" khỏi yêu thích!`, 'Thông báo');
        },
        (error) => {
          this.toastr.error('Lỗi khi xóa yêu thích!', 'Lỗi');
          console.error('Lỗi khi xóa yêu thích:', error);
        }
      );
    } else {
      this.favoriteService.addFavorite(this.productId).subscribe(
        () => {
          this.product.isFavorite = true;
          this.toastr.success(`Đã thêm "${this.product.name}" vào yêu thích!`, 'Thành công');
        },
        (error) => {
          this.toastr.error('Lỗi khi thêm yêu thích!', 'Lỗi');
          console.error('Lỗi khi thêm yêu thích:', error);
        }
      );
    }
  }

  onAddToCart() {
    if (!this.selectedVariant) {
      this.toastr.warning('Sản phẩm đã hết, vui lòng chọn sản phẩm khác!', 'Thông báo');
      return;
    }
    if (this.selectedVariant.stockQuantity < this.quantity) {
      this.toastr.error(`Chỉ còn ${this.selectedVariant.stockQuantity} sản phẩm trong kho!`, 'Lỗi');
      return;
    }

    this.cartService.addItemToCart(this.selectedVariant.variantId, this.quantity).subscribe(
      () => {
        this.toastr.success('Sản phẩm đã được thêm vào giỏ hàng!', 'Thành công');
      },
      () => {
        this.toastr.error('Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!', 'Lỗi');
      }
    );
  }

  closeModal() {
    this.productId = 0; 
  }
}
