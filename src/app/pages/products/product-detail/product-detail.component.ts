import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from 'src/app/service/product.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { CartService } from 'src/app/service/cart.service'; 
import { Product } from 'src/app/types/products';
import { ProductImage } from 'src/app/types/product-image';
import { ProductVariant } from 'src/app/types/product-variant';
import { TokenService } from 'src/app/service/token.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  
  product: Product = {} as Product;
  productImages: ProductImage[] = [];
  productVariants: ProductVariant[] = [];


  selectedImage: string = '';
  selectedColor: string = '';
  selectedSize: string = '';
  selectedVariant!: ProductVariant | null; // Lưu biến thể được chọn
  quantity = 1;
  productId!: number;

  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cartService: CartService ,
    private tokenService: TokenService ,
    private toastr: ToastrService  ,
    private renderer: Renderer2, //  Dùng để tạo hiệu ứng ảnh bay
  private el: ElementRef //  Lấy vị trí của phần tử trong DOM
  ) {}

  ngOnInit(): void {
    this.userId = this.tokenService.getUserId(); // 🟢 Lấy user ID
    this.route.paramMap.subscribe((params) => {
      this.productId = Number(params.get('id'));
      if (this.productId) {
        this.loadProductDetails();
      }
    });
  }


  

  loadProductDetails(): void {
    this.productService.getProductById(this.productId).subscribe(
      (data) => {
        this.product = data;
      },
      (error) => console.error('Lỗi khi tải sản phẩm:', error)
    );

    this.productImageService.getAllProductImages(this.productId).subscribe(
      (data) => {
        this.productImages = data;
        this.selectedImage = this.productImages.length > 0 ? this.productImages[0].imageUrl : 'assets/images/default-product.jpg';
      },
      (error) => console.error('Lỗi khi tải ảnh sản phẩm:', error)
    );

    this.productVariantService.getAllVariantsByProductId(this.productId).subscribe(
      (data) => {
        this.productVariants = data;

        if (this.productVariants.length > 0) {
          this.selectedColor = this.productVariants[0].color || '';
          this.selectedSize = this.productVariants[0].size || '';
          this.updateSelectedVariant();
        }
      },
      (error) => console.error('Lỗi khi tải biến thể sản phẩm:', error)
    );
  }

  updateSelectedVariant(): void {
    this.selectedVariant = this.productVariants.find(
      (variant) => variant.color === this.selectedColor && variant.size === this.selectedSize
    ) || null;
  }

  onSelectImage(img: string) {
    this.selectedImage = img;
  }

  onSelectColor(color: string) {
    this.selectedColor = color;
    this.updateSelectedVariant();
  
    // Nếu biến thể có ảnh riêng, thay đổi ảnh chính
    if (this.selectedVariant?.imageUrl) {
      this.selectedImage = this.selectedVariant.imageUrl;
    } else {
      // Nếu không có ảnh biến thể, giữ nguyên ảnh chính ban đầu
      this.selectedImage = this.productImages.length > 0 ? this.productImages[0].imageUrl : 'assets/images/default-product.jpg';
    }
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

  onAddToCart(event: MouseEvent) {
    if (!this.selectedVariant) {
      this.toastr.warning('Sản phẫm đã hết vui lòng chọn sản phẩm khác !', 'Thông báo');
      return;
    }
    if (this.selectedVariant.stockQuantity < this.quantity) {
      this.toastr.error(`Chỉ còn ${this.selectedVariant.stockQuantity} sản phẩm trong kho!`, 'Lỗi');
      return;
    }

    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.toastr.error('Vui lòng đăng nhập trước khi thêm vào giỏ hàng!', 'Lỗi');
      return;
    }

    //  Gọi API thêm sản phẩm vào giỏ hàng
    this.cartService.addItemToCart(this.selectedVariant.variantId, this.quantity).subscribe(
      (response) => {
        this.toastr.success('Sản phẩm đã được thêm vào giỏ hàng!', 'Thành công');
        this.animateImageToCart(event); // Gọi hiệu ứng bay ảnh sản phẩm
      },
      (error) => {
        this.toastr.error('Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại!', 'Lỗi');
      }
    );
  }
  animateImageToCart(event: MouseEvent) {
    const cartIcon = document.querySelector('.cart-icon img'); // 🛒 Icon giỏ hàng
    const productImage = this.el.nativeElement.querySelector('.main-image img'); // 📷 Ảnh sản phẩm chính
  
    if (cartIcon && productImage) {
      const cartRect = cartIcon.getBoundingClientRect(); // Lấy tọa độ giỏ hàng
      const productRect = productImage.getBoundingClientRect(); // Lấy tọa độ ảnh sản phẩm
  
      // Khoảng cách từ sản phẩm đến giỏ hàng
      let xDistance = cartRect.left - productRect.left;
      let yDistance = cartRect.top - productRect.top;
  
      // Chỉnh tay giá trị để bay chính xác hơn (Bạn có thể thay đổi các số này)
      const xOffset = 3500;  // Điều chỉnh vị trí ngang (trái/phải)
      const yOffset = -350;  // Điều chỉnh vị trí dọc (lên/xuống)
  
      // Tính toán thời gian bay linh hoạt
      const distance = Math.sqrt(xDistance ** 2 + yDistance ** 2);
      const duration = Math.min(4, Math.max(0.5, distance / 500));
  
      const imgClone = productImage.cloneNode(true) as HTMLElement;
      this.renderer.addClass(imgClone, 'fly-image');
  
      // Set tọa độ ban đầu
      imgClone.style.left = `${productRect.left}px`;
      imgClone.style.top = `${productRect.top}px`;
  
      // Set biến động X, Y và thời gian
      imgClone.style.setProperty('--x', `${xDistance}px`);
      imgClone.style.setProperty('--y', `${yDistance}px`);
      imgClone.style.setProperty('--x-offset', `${xOffset}px`);
      imgClone.style.setProperty('--y-offset', `${yOffset}px`);
      imgClone.style.setProperty('--duration', `${duration}s`);
  
      document.body.appendChild(imgClone);
  
      //  Xóa ảnh bay khi animation hoàn tất
      setTimeout(() => {
        imgClone.remove();
      }, duration * 1000);
    }
  }
  

  onBuyNow() {
    if (!this.selectedVariant) {
      this.toastr.warning('Vui lòng chọn sản phẩm!', 'Thông báo');
      return;
    }
    if (this.selectedVariant.stockQuantity < this.quantity) {
      this.toastr.error(`Chỉ còn ${this.selectedVariant.stockQuantity} sản phẩm trong kho!`, 'Lỗi');
      return;
    }

    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.toastr.error('Vui lòng đăng nhập trước khi mua hàng!', 'Lỗi');
      return;
    }

    this.cartService.addItemToCart(this.selectedVariant.variantId, this.quantity).subscribe(
      (response) => {
        this.toastr.success('Sản phẩm đã được thêm vào giỏ hàng! Đang chuyển đến thanh toán...', 'Thành công');
        setTimeout(() => {
          window.location.href = '/checkout';
        }, 1000);
      },
      (error) => {
        this.toastr.error('Lỗi khi đặt hàng. Vui lòng thử lại!', 'Lỗi');
      }
    );
  }
}
