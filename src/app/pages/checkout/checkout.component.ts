import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/service/cart.service';
import { OrderService } from 'src/app/service/order.service';
import { PaymentService } from 'src/app/service/payment.service';
import { UserAddressService } from 'src/app/service/user-address.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { PaymentMethodService } from 'src/app/service/payment-method.service';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/service/token.service';
import { UserAddress } from 'src/app/types/user-address';
import { Router } from '@angular/router'; // Import Router
import { ShipMethodService } from 'src/app/service/ship-method.service';
import { ShipMethod } from 'src/app/types/ship-method';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  paymentMethod: string = '';
  cartItems: any[] = [];
  totalPrice: number = 0;
  productVariants: { [variantId: number]: any } = {};
  paymentMethods: any[] = [];
  userAddresses: UserAddress[] = [];
  selectedAddressId: number | null = null;
  showAddressForm: boolean = false;
  isEditingAddress: boolean = false;

  shippingMethods: ShipMethod[] = [];
  selectedShippingMethodId: number = 0;

  newAddress: UserAddress = {
    addressId: 0,
    userId: 0,
    addressLine: '',
    city: '',
    district: '',
    ward: '',
    isDefault: true
  };

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
    private shipMethodService: ShipMethodService
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.loadPaymentMethods();
    this.loadUserAddresses();
    this.loadShippingMethods();
  }

  // ✅ Lấy giỏ hàng
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

  //  Lấy thông tin biến thể sản phẩm từ `ProductVariantService`
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
  loadShippingMethods() {
    this.shipMethodService.getAllShipMethods().subscribe({
      next: (data: ShipMethod[]) => {
        this.shippingMethods = data;
      },
      error: (error) => {
        console.error('Error loading shipping methods:', error);
        this.toastr.error('Không thể tải phương thức vận chuyển!', 'Lỗi');
      }
    });
  }
  selectShippingMethod(methodId: number) {
    this.selectedShippingMethodId = methodId;
    console.log('Shipping method selected:', methodId); // Debug log
  }
  // Thêm hàm để lấy phí vận chuyển
  getShippingFee(): number {
    const selectedMethod = this.shippingMethods.find(m => m.ship_method_id === this.selectedShippingMethodId);
    return selectedMethod ? selectedMethod.shippingFee : 0;
  }


  // ✅ Lấy phương thức thanh toán
  loadPaymentMethods() {
    this.paymentMethodService.getAllPaymentMethods().subscribe(
      (data) => {
        this.paymentMethods = data.map(method => ({
          ...method,
          iconUrl: this.paymentIcons[method.code] || this.paymentIcons['default']
        }));
      },
      () => this.toastr.error('Không thể tải phương thức thanh toán!', 'Lỗi')
    );
  }

  //  Lấy danh sách địa chỉ giao hàng
  loadUserAddresses() {
    const userId = this.tokenService.getUserId();
    this.userAddressService.getAddressesByUserId(userId).subscribe(
      (data) => {
        if (!Array.isArray(data)) {
          console.error('Lỗi: API trả về không phải mảng', data);
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

  //  Chọn địa chỉ mặc định
  setDefaultAddress(addressId: number) {
    this.userAddresses.forEach(addr => addr.isDefault = addr.addressId === addressId);
    this.selectedAddressId = addressId;
  }

  //  Hiển thị form thêm/sửa địa chỉ
  toggleAddressForm(editing = false, address: UserAddress | null = null) {
    this.showAddressForm = !this.showAddressForm;
    this.isEditingAddress = editing;
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

  //  Lưu địa chỉ mới / cập nhật địa chỉ
  saveAddress() {
    if (this.isEditingAddress) {
      this.userAddressService.updateAddress(this.newAddress.addressId, this.newAddress).subscribe(
        () => {
          this.toastr.success('Cập nhật địa chỉ thành công!');
          this.loadUserAddresses();
          this.showAddressForm = false;
        },
        () => this.toastr.error('Lỗi khi cập nhật địa chỉ!')
      );
    } else {
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

  //  Tính tổng tiền đơn hàng
  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + (this.getVariantDetails(item.variantId, 'price') * item.quantity), 0);
  }

  //  Lấy thông tin sản phẩm từ productVariants
  getVariantDetails(variantId: number, key: 'size' | 'color' | 'imageUrl' | 'price'): any {
    return this.productVariants[variantId]?.[key] || (key === 'price' ? 0 : 'N/A');
  }

  //  Đặt hàng (Checkout + Thanh toán)
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

    this.orderService.checkout(userId, this.selectedAddressId, this.selectedShippingMethodId).subscribe(
      (order) => {
        this.processPayment(order.orderId);
      },
      () => this.toastr.error('Lỗi khi tạo đơn hàng!', 'Thất bại')
    );
  }



  //  Xử lý thanh toán
  processPayment(orderId: number) {
    this.paymentService.createPayment(orderId, this.paymentMethod).subscribe(
      (response) => {
        // Nếu là thanh toán online, chuyển hướng đến cổng thanh toán
        if (response.startsWith('http')) {
          window.location.href = response;
        } else {
          // Chuyển hướng đến trang thông báo
          this.router.navigate(['/payment-result'], { queryParams: { status: 'success' } });
        }
      },
      () => {
        this.router.navigate(['/payment-result'], { queryParams: { status: 'failed' } });
      }
    );
  }


}
