import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/service/cart.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice = 0;
  productVariants: { [variantId: number]: any } = {}; // Lưu thông tin biến thể theo variantId
  productBrands: { [variantId: number]: any } = {}; // Lưu brand theo variantId
  deliveryDate: string = '';
  deliveryTime: string = '';
  exportInvoice: boolean = false;

  constructor(
    private cartService: CartService,
    private productVariantService: ProductVariantService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }


  groupedCart: Record<string, any[]> = {}; // Khai báo kiểu dữ liệu rõ ràng

  /**
   * 🏷 **Nhóm sản phẩm theo thương hiệu**
   */
  groupCartByBrand() {
    this.groupedCart = this.cartItems.reduce((groups: Record<string, any[]>, item) => {
      const brandName = this.getBrandDetails(item.variantId, 'name');
      if (!groups[brandName]) {
        groups[brandName] = [];
      }
      groups[brandName].push(item);
      return groups;
    }, {});
  }
  


  /**
   * 🛒 **Tải giỏ hàng**
   */
  loadCart() {
    this.cartService.getCart().subscribe(
      (data) => {
        this.cartItems = data.cartItems;
        this.calculateTotal();
  
        // Lấy thông tin biến thể (size, color, image)
        const variantIds = this.cartItems.map((item) => item.variantId);
        variantIds.forEach((variantId) => {
          this.loadProductVariant(variantId);
          this.loadProductBrand(variantId);
        });
  
        // Chờ một chút để dữ liệu brand được cập nhật
        setTimeout(() => {
          this.groupCartByBrand();
        }, 500);
      },
      (error) => {
        this.toastr.error('Không thể tải giỏ hàng!', 'Lỗi');
      }
    );
  }
  

  /**
   * 📦 **Lấy thông tin biến thể sản phẩm (size, color, image)**
   */
  loadProductVariant(variantId: number) {
    this.productVariantService.getVariantById(variantId).subscribe(
      (variant) => {
        this.productVariants[variantId] = {
          size: variant.size || 'N/A',
          color: variant.color || 'N/A',
          imageUrl: variant.imageUrl || 'assets/images/default-product.jpg',
        };
      },
      (error) => {
        this.productVariants[variantId] = {
          size: 'N/A',
          color: 'N/A',
          imageUrl: 'assets/images/default-product.jpg',
        };
      }
    );
  }
   /**
   * 🏷 **Lấy Brand từ variantId**
   */
   loadProductBrand(variantId: number) {
    this.productVariantService.getBrandByVariantId(variantId).subscribe(
      (brand) => {
        this.productBrands[variantId] = {
          name: brand.name || 'Không có thông tin',
          logoUrl: brand.logoUrl || 'assets/images/default-brand.jpg',
        };
      },
      (error) => {
        this.productBrands[variantId] = {
          name: 'Không có thông tin',
          logoUrl: 'assets/images/default-brand.jpg',
        };
      }
    );
  }

  /**
   * 🔍 **Lấy thông tin biến thể từ variantId**
   */
  getVariantDetails(variantId: number, key: 'size' | 'color' | 'imageUrl'): string {
    return this.productVariants[variantId]?.[key] || 'N/A';
  }
     /**
   * 🔍 **Lấy thông tin Brand từ variantId**
   */
     getBrandDetails(variantId: number, key: 'name' | 'logoUrl'): string {
      return this.productBrands[variantId]?.[key] || 'N/A';
    }

  /**
   * 🔄 **Cập nhật số lượng sản phẩm**
   */
  updateQuantity(item: any, change: number) {
    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      this.toastr.warning('Số lượng không thể nhỏ hơn 1!', 'Thông báo');
      return;
    }

    this.cartService.updateCartItem(item.variantId, newQuantity).subscribe(
      () => {
        item.quantity = newQuantity;
        item.totalPrice = newQuantity * item.unitPrice;
        this.calculateTotal();
        this.toastr.success('Cập nhật giỏ hàng thành công!', 'Thành công');
      },
      (error) => {
        this.toastr.error('Lỗi khi cập nhật giỏ hàng!', 'Lỗi');
      }
    );
  }

  /**
   * ❌ **Xóa sản phẩm khỏi giỏ hàng**
   */
  /**
 * ❌ **Xóa sản phẩm khỏi giỏ hàng**
 */
removeFromCart(cartItemId: number) {
  this.cartService.removeItemFromCart(cartItemId).subscribe(
    () => {
      // Cập nhật lại giỏ hàng sau khi xóa
      this.cartItems = this.cartItems.filter((item) => item.cartItemId !== cartItemId);
      this.calculateTotal();

      // Gọi lại nhóm sản phẩm theo thương hiệu để cập nhật giao diện ngay lập tức
      this.groupCartByBrand();

      this.toastr.success('Sản phẩm đã được xóa!', 'Thành công');
    },
    (error) => {
      this.toastr.error('Lỗi khi xóa sản phẩm!', 'Lỗi');
    }
  );
}

  /**
   * 🧾 **Tính tổng tiền**
   */
  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  /**
   * 💳 **Thanh toán**
   */
  checkout() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Giỏ hàng trống!', 'Thông báo');
      return;
    }
    this.toastr.success('Chuyển đến trang thanh toán...', 'Thanh toán');
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 2000);
  }
}
