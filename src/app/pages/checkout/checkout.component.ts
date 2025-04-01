import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/service/cart.service';
import { OrderService } from 'src/app/service/order.service';
import { PaymentService } from 'src/app/service/payment.service';
import { UserAddressService } from 'src/app/service/user-address.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { PaymentMethodService } from 'src/app/service/payment-method.service';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/service/token.service';
import { Router } from '@angular/router';
import { ShipMethodService } from 'src/app/service/ship-method.service';
import { ShipMethod } from 'src/app/types/ship-method';
import { UserAddress } from 'src/app/types/user-address';
import { initAOS } from 'src/assets/aos-init';

import { VoucherService } from 'src/app/service/voucher.service';
import { Voucher } from 'src/app/types/voucher'
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  // Dữ liệu giỏ hàng
  cartItems: any[] = [];
  totalPrice: number = 0;
  productVariants: { [variantId: number]: any } = {};

  // Phương thức thanh toán
  paymentMethod: string = '';
  paymentMethods: any[] = [];


  voucherCode: string = '';
  activeVoucher: Voucher | null = null;



  paymentIcons: { [key: string]: string } = {
    'COD': 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
    'momo': 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
    'vnpay': 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png',
    'paypal': 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png'
  };
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private userAddressService: UserAddressService,
    private productVariantService: ProductVariantService,
    private paymentMethodService: PaymentMethodService,
    private toastr: ToastrService,
    private tokenService: TokenService,
    private router: Router,
    private shipMethodService: ShipMethodService,
    private voucherService: VoucherService
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.loadPaymentMethods();
    this.loadUserAddresses();
    this.loadShippingMethods();
    initAOS();
  }

   // Biến hiển thị loading khi xử lý thanh toán
   isProcessingPayment: boolean = false;

  // Địa chỉ giao hàng
  userAddresses: UserAddress[] = [];
  selectedAddressId: number | null = null;
  showAddressForm: boolean = false;
  // Thêm biến để toggle danh sách lựa chọn địa chỉ
  showAddressSelection: boolean = false;

  // Phương thức vận chuyển
  shippingMethods: ShipMethod[] = [];
  selectedShippingMethodId: number = 0;
  // Thêm biến để toggle danh sách lựa chọn phương thức vận chuyển
  showShippingSelection: boolean = false;

  // Dữ liệu cho form thêm/sửa địa chỉ
  newAddress: UserAddress = {
    addressId: 0,
    userId: 0,
    addressLine: '',
    city: '',
    district: '',
    ward: '',
    isDefault: true
  };
  applyVoucher() {
    if (!this.voucherCode.trim()) {
        this.toastr.warning('Vui lòng nhập mã giảm giá!', 'Thông báo');
        return;
    }

    this.voucherService.getVoucherByCode(this.voucherCode).subscribe({
        next: (voucher) => {
          

            if (!voucher) {
                this.toastr.error('Không tìm thấy voucher!', 'Thất bại');
                return;
            }

            const expiryDate = new Date(voucher.expiryDate);
            const currentTime = new Date();

            // ✅ Kiểm tra nếu `voucher.quantity` bằng 0
            if (voucher.quantity <= 0) {
                this.toastr.error('Mã giảm giá đã hết số lượng sử dụng!', 'Thất bại');
                this.activeVoucher = null;
                return;
            }

            // ✅ Kiểm tra nếu voucher không hoạt động
            if (!voucher.active) {
                this.toastr.error('Mã giảm giá không hợp lệ hoặc đã bị vô hiệu hóa!', 'Thất bại');
                this.activeVoucher = null;
                return;
            }

            // ✅ Kiểm tra hạn sử dụng
            if (expiryDate.getTime() < currentTime.getTime()) {
                this.toastr.error('Mã giảm giá đã hết hạn!', 'Thất bại');
                this.activeVoucher = null;
                return;
            }

            // ✅ Nếu tất cả điều kiện hợp lệ, áp dụng voucher
            this.activeVoucher = voucher;
            this.toastr.success(`Áp dụng thành công: ${voucher.voucherCode}!`, 'Thành công');
        },
        error: (error) => {
            this.toastr.error('Mã giảm giá không hợp lệ hoặc đã hết số lượng!', 'Thất bại');
            this.activeVoucher = null;
        }
    });
}


  // ✅ Xóa mã giảm giá
  removeVoucher() {
    this.activeVoucher = null;
    this.voucherCode = '';
  }

  // ✅ Tính số tiền được giảm từ voucher
  getVoucherDiscount(): number {
    if (!this.activeVoucher) return 0;

    let discount = 0;
    if (this.activeVoucher.discountType === 'FIXED_AMOUNT') {
      discount = this.activeVoucher.discountAmount;
    } else if (this.activeVoucher.discountType === 'PERCENTAGE') {
      discount = (this.totalPrice * this.activeVoucher.discountAmount) / 100;
      if (this.activeVoucher.maxDiscount) {
        discount = Math.min(discount, this.activeVoucher.maxDiscount);
      }
    }

    return Math.min(discount, this.totalPrice);
  }

  // ✅ Tính tổng giá cuối cùng (Sau giảm giá)
  getFinalTotal(): number {
    return this.totalPrice + this.getShippingFee() - this.getVoucherDiscount();
  }

  goBackToCart(){
    this.router.navigate(['/cart']);
  }

  // Lấy giỏ hàng
  loadCart() {
    this.cartService.getCart().subscribe(
      (data) => {
        this.cartItems = data.cartItems;
        this.calculateTotal();
        this.loadProductDetails();
      },
      () => this.toastr.error('Không thể tải giỏ hàng!', 'Lỗi')
    );
  }

  // Tính tổng tiền
  calculateTotal() {
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + (this.getVariantDetails(item.variantId, 'price') * item.quantity),
      0
    );
  }

  // Lấy thông tin biến thể sản phẩm
  loadProductDetails() {
    const variantIds = this.cartItems.map((item) => item.variantId);
    variantIds.forEach((variantId) => {
      this.loadProductVariant(variantId);
    });
  }

  loadProductVariant(variantId: number) {
    this.productVariantService.getVariantById(variantId).subscribe(
      (variant) => {
        this.productVariants[variantId] = {
          size: variant.size || 'N/A',
          color: variant.color || 'N/A',
          imageUrl: variant.imageUrl && variant.imageUrl !== 'N/A' ? variant.imageUrl : 'assets/images/default-product.jpg',
          price: variant.price || 0
        };
        this.calculateTotal();
      },
      () => {
        this.productVariants[variantId] = {
          size: 'N/A',
          color: 'N/A',
          imageUrl: 'assets/images/default-product.jpg',
          price: 0
        };
        this.calculateTotal();
      }
    );
  }

  // Lấy phương thức vận chuyển
  loadShippingMethods() {
    this.shipMethodService.getAllShipMethods().subscribe({
      next: (data: ShipMethod[]) => {
        // console.log("✅ API trả về phương thức vận chuyển:", data);
        if (!Array.isArray(data) || data.length === 0) {
          // console.error("API không trả về mảng hợp lệ hoặc rỗng!", data);
          this.shippingMethods = [];
          return;
        }
        this.shippingMethods = data;
        if (!this.selectedShippingMethodId && this.shippingMethods.length > 0) {
          this.selectedShippingMethodId = this.shippingMethods[0].ship_method_id;
        }
      },
      error: (error) => {
        // console.error("Lỗi khi tải phương thức vận chuyển:", error);
        this.toastr.error("Không thể tải phương thức vận chuyển!", "Lỗi");
      }
    });
  }

  selectShippingMethod(method: ShipMethod) {
    if (!method || !method.ship_method_id) {
      this.toastr.warning("Phương thức vận chuyển không hợp lệ!", "Thông báo");
      return;
    }
    this.selectedShippingMethodId = method.ship_method_id;
    this.showShippingSelection = false; // ẩn danh sách sau khi chọn
    // console.log("🚀 Đã chọn phương thức vận chuyển:", method);
  }

  getShippingFee(): number {
    const selectedMethod = this.shippingMethods.find(m => m.ship_method_id === this.selectedShippingMethodId);
    return selectedMethod ? selectedMethod.shippingFee : 0;
  }

  // Lấy phương thức thanh toán
  loadPaymentMethods() {
    this.paymentMethodService.getAllPaymentMethods().subscribe(
      (data) => {
        this.paymentMethods = data.map(method => ({
          ...method,
          iconUrl: this.paymentIcons[method.code] || this.paymentIcons['COD']
        }));
      },
      () => this.toastr.error('Không thể tải phương thức thanh toán!', 'Lỗi')
    );
  }

  // Lấy danh sách địa chỉ giao hàng
  loadUserAddresses() {
    const userId = this.tokenService.getUserId();
    this.userAddressService.getAddressesByUserId(userId).subscribe(
      (data) => {
        if (!Array.isArray(data)) {
          // console.error('Lỗi: API trả về không phải mảng', data);
          this.userAddresses = [];
          return;
        }
        this.userAddresses = data;
        if (data.length > 0) {
          this.selectedAddressId = data.find(addr => addr.isDefault)?.addressId || data[0].addressId;
        }
      },
      () => this.toastr.error('Không thể tải địa chỉ của bạn!', 'Lỗi')
    );
  }

  // Chọn địa chỉ mặc định
  setDefaultAddress(addressId: number) {
    this.userAddresses.forEach(addr => addr.isDefault = addr.addressId === addressId);
    this.selectedAddressId = addressId;
    this.showAddressSelection = false; // ẩn danh sách sau khi chọn
  }

  // Hàm trợ giúp: trả về đối tượng địa chỉ theo ID
  getAddress(addressId: number): UserAddress | undefined {
    return this.userAddresses.find(address => address.addressId === addressId);
  }

  // Hàm trợ giúp: trả về đối tượng phương thức vận chuyển theo ID
  getShippingMethod(methodId: number): ShipMethod | undefined {
    return this.shippingMethods.find(method => method.ship_method_id === methodId);
  }

  // Toggle hiển thị form thêm/sửa địa chỉ
  toggleAddressForm(editing: boolean = false, address: UserAddress | null = null) {
    this.showAddressForm = !this.showAddressForm;
    if (editing && address) {
      this.newAddress = { ...address };
    } else {
      this.newAddress = {
        userId: this.tokenService.getUserId(),
        addressLine: '',
        city: '',
        district: '',
        ward: '',
        isDefault: false
      } as UserAddress;
    }
  }

  // Toggle hiển thị danh sách địa chỉ (để lựa chọn)
  toggleAddressSelection(): void {
    this.showAddressSelection = !this.showAddressSelection;
  }

  // Toggle hiển thị danh sách phương thức vận chuyển (để lựa chọn)
  toggleShippingSelection(): void {
    this.showShippingSelection = !this.showShippingSelection;
  }

  // Lưu địa chỉ mới / cập nhật địa chỉ
  saveAddress() {
    if (this.newAddress.addressId && this.userAddresses.find(addr => addr.addressId === this.newAddress.addressId)) {
      // Cập nhật địa chỉ
      this.userAddressService.updateAddress(this.newAddress.addressId, this.newAddress).subscribe(
        () => {
          this.toastr.success('Cập nhật địa chỉ thành công!');
          this.loadUserAddresses();
          this.showAddressForm = false;
        },
        () => this.toastr.error('Lỗi khi cập nhật địa chỉ!')
      );
    } else {
      // Tạo địa chỉ mới
      this.userAddressService.createAddress(this.newAddress).subscribe(
        () => {
          this.toastr.success('Thêm địa chỉ mới thành công!');
          this.loadUserAddresses();
          this.showAddressForm = false;
        },
        () => this.toastr.error('Lỗi khi thêm địa chỉ!')
      );
    }
  }

  // Lấy thông tin sản phẩm từ productVariants
  getVariantDetails(variantId: number, key: 'size' | 'color' | 'imageUrl' | 'price'): any {
    return this.productVariants[variantId]?.[key] || (key === 'price' ? 0 : 'N/A');
  }

  // Đặt hàng (Checkout + Thanh toán)
  placeOrder() {
    if (!this.selectedAddressId) {
      this.toastr.warning('Vui lòng chọn địa chỉ giao hàng!', 'Thông báo');
      return;
    }
    if (!this.paymentMethod) {
      this.toastr.warning('Vui lòng chọn phương thức thanh toán!', 'Thông báo');
      return;
    }
    if (!this.selectedShippingMethodId) {
      this.toastr.warning('Vui lòng chọn phương thức vận chuyển!', 'Thông báo');
      return;
    }

    const userId = this.tokenService.getUserId();

    // this.orderService.checkout(userId, this.selectedAddressId, this.selectedShippingMethodId,this.activeVoucher?.voucherCode).subscribe(
    //   (order) => {
    //     this.processPayment(order.orderId);
    //   },
    //   (error) => {
    //     // console.error("🚨 Lỗi khi tạo đơn hàng:", error);
    //     this.toastr.error(error.error?.message || 'Lỗi khi tạo đơn hàng!', 'Thất bại');
    //   }
    // );
    this.orderService.checkout(userId, this.selectedAddressId, this.selectedShippingMethodId, this.activeVoucher?.voucherCode)
      .subscribe({
        next: (order) => {
          // Sau khi checkout thành công, gửi email xác nhận đơn hàng
          this.orderService.sendOrderMail(order.orderId).subscribe({
            next: () => {
              this.toastr.success('Email xác nhận đã được gửi đến bạn!');
            },
            error: (err) => {
              this.toastr.error('Lỗi gửi email xác nhận: ' + err);
            }
          });

          // Sau đó, xử lý thanh toán
          this.processPayment(order.orderId);
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Lỗi khi tạo đơn hàng!', 'Thất bại');
        }
      });
  }

  // Xử lý thanh toán
  processPayment(orderId: number) {
    // Bắt đầu hiển thị loading
    this.isProcessingPayment = true;

    this.paymentService.createPayment(orderId, this.paymentMethod).subscribe({
      next: (response: string) => {
        // Kết thúc loading
        this.isProcessingPayment = false;
        if (response.startsWith('http')) {
          window.location.href = response;
        } else {
          this.router.navigate(['/payment-result'], { queryParams: { status: 'success' } });
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        this.router.navigate(['/payment-result'], { queryParams: { status: 'failed' } });
      }
    });
  }
}
