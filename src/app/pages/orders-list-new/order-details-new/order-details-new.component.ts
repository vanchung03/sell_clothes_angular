import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// Interfaces
import { Order } from 'src/app/types/order';
import { OrderItem } from 'src/app/types/order-item';
import { Payment } from 'src/app/types/payment';
import { User } from 'src/app/types/User';
import { UserAddress } from 'src/app/types/user-address';
import { ShipMethod } from 'src/app/types/ship-method';
import { ProductVariant } from 'src/app/types/product-variant';

// Services
import { OrderService } from 'src/app/service/order.service';
import { OrderItemService } from 'src/app/service/order-item.service';
import { PaymentService } from 'src/app/service/payment.service';
import { UserService } from 'src/app/service/user.service';
import { UserAddressService } from 'src/app/service/user-address.service';
import { ShipMethodService } from 'src/app/service/ship-method.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';

import * as AOS from 'aos';
@Component({
  selector: 'app-order-details-new',
  templateUrl: './order-details-new.component.html',
  styleUrls: ['./order-details-new.component.scss']
})
export class OrderDetailsNewComponent implements OnInit {
  orderId!: number;
  order!: Order;
  orderItems: OrderItem[] = [];
  payment!: Payment;
  user!: User;
  userAddress!: UserAddress;
  shipMethod!: ShipMethod;

  // Quản lý trạng thái loading / error
  isLoading = false;
  errorMessage = '';

  // Biến cục bộ để lưu Date dạng object (thay vì string)
  orderCreatedDate!: Date;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private orderItemService: OrderItemService,
    private paymentService: PaymentService,
    private userService: UserService,
    private userAddressService: UserAddressService,
    private shipMethodService: ShipMethodService,
    private productVariantService: ProductVariantService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.orderId) {
      this.loadOrderDetails(this.orderId);
    }
  }

  // 1. Lấy toàn bộ thông tin đơn hàng
  loadOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order: Order) => {
        this.order = order;

        // Ép kiểu Date cho ngày tạo
        this.orderCreatedDate = order.createdAt
          ? new Date(order.createdAt)
          : new Date();

        // 2. Lấy danh sách sản phẩm trong đơn
        this.orderItemService.getOrderItemsByOrderId(orderId).subscribe({
          next: (items: OrderItem[]) => {
            this.orderItems = items;

            // Lấy thêm thông tin biến thể (nếu cần)
            this.orderItems.forEach((item) => {
              this.productVariantService.getVariantById(item.variantId).subscribe({
                next: (variant: ProductVariant) => {
                  item.variant = variant;
                },
                error: (err) => {
                  console.error('Lỗi khi lấy variant:', err);
                }
              });
            });
          },
          error: (err) => {
            console.error('Lỗi khi lấy order items:', err);
          }
        });

        // 3. Thông tin thanh toán
        this.paymentService.getPaymentByOrderId(orderId).subscribe({
          next: (payment: Payment) => {
            this.payment = payment;
          },
          error: (err) => {
            console.error('Lỗi khi lấy payment:', err);
          }
        });

        // 4. Phương thức vận chuyển
        if (order.shipMethodId) {
          this.shipMethodService.getShipMethodById(order.shipMethodId).subscribe({
            next: (method: ShipMethod) => {
              this.shipMethod = method;
            },
            error: (err) => {
              console.error('Lỗi khi lấy shipMethod:', err);
            }
          });
        }

        // 5. Địa chỉ giao hàng
        if (order.addressId) {
          this.userAddressService.getAddressById(order.addressId).subscribe({
            next: (address: UserAddress) => {
              this.userAddress = address;
            },
            error: (err) => {
              console.error('Lỗi khi lấy address:', err);
            }
          });
        }

        // 6. Người dùng
        if (order.userId) {
          this.userService.getUserById(order.userId).subscribe({
            next: (user: User) => {
              this.user = user;
            },
            error: (err) => {
              console.error('Lỗi khi lấy user:', err);
            }
          });
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin đơn hàng';
        this.isLoading = false;
        console.error('Lỗi khi lấy order:', err);
      }
    });
  }

  // 2. Định dạng ngày tháng theo dd/mm/yyyy HH:mm
  parseDate(dateStr: any): string {
    if (!dateStr) return 'Không có';

    try {
      let date: Date;

      // Kiểm tra kiểu
      if (dateStr instanceof Date) {
        date = dateStr;
      } else if (typeof dateStr === 'string') {
        date = new Date(dateStr);
      } else if (typeof dateStr === 'number') {
        date = new Date(dateStr);
      } else {
        console.warn('Không hỗ trợ kiểu dữ liệu date:', dateStr);
        return 'Không xác định';
      }

      // Kiểm tra hợp lệ
      if (isNaN(date.getTime())) {
        console.warn('Giá trị ngày không hợp lệ:', dateStr);
        return 'Không hợp lệ';
      }

      // Format
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      return 'Lỗi';
    }
  }

  // 3. Kiểm tra trạng thái step cho progress bar
  checkStepCompleted(step: string): boolean {
    // Giả sử ta có thứ tự: PENDING -> CONFIRMED -> SHIPPING -> COMPLETED -> CANCELLED
    const orderStatusMap = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
    const currentIndex = orderStatusMap.indexOf(this.order?.status || '');
    const stepIndex = orderStatusMap.indexOf(step);
    return stepIndex <= currentIndex;
  }

  // 4. Cho phép hủy đơn hàng không?
  canCancelOrder(status: string): boolean {
    // Tuỳ logic: PENDING cho hủy
    if (!status) return false;
    const cancellableStates = ['PENDING'];
    return cancellableStates.includes(status);
  }

  // 5. Hủy đơn hàng
  onCancelOrder(orderId: number) {
    // Gọi API updateOrderStatus(...)
    this.orderService.updateOrderStatus(orderId, 'CANCELLED').subscribe({
      next: (updatedOrder) => {
        this.order.status = updatedOrder.status;
        alert('Đơn hàng đã được hủy!');
      },
      error: (err) => {
        console.error('Lỗi hủy đơn hàng:', err);
        alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
      }
    });
  }
  // Hàm xử lý thanh toán đã có
  processPayment(orderId: number) {
    // Giả sử gọi PaymentService để xử lý thanh toán
    this.paymentService.createPayment(orderId, this.payment.method).subscribe(
      (response: string) => {
        if (response.startsWith('http')) {
          window.location.href = response;
        } else {
          this.router.navigate(['/payment-result'], { queryParams: { status: 'success' } });
        }
      },
      () => {
        this.router.navigate(['/payment-result'], { queryParams: { status: 'failed' } });
      }
    );
  }

  // Hàm Thanh Toán Ngay (payNow)
  payNow(orderId: number) {
    // Ví dụ: gọi lại hàm xử lý thanh toán
    this.processPayment(orderId);
  }

  // 6. Lấy label cho trạng thái (nếu cần)
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Chờ Xử Lý';
      case 'CONFIRMED': return 'Đã Xác Nhận';
      case 'SHIPPING': return 'Đang Giao';
      case 'COMPLETED': return 'Hoàn Thành';
      case 'CANCELLED': return 'Đã Hủy';
      default: return status;
    }
  }
}
