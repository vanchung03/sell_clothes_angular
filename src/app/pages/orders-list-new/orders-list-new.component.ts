import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/service/order.service';
import { Order } from 'src/app/types/order';
import { Router } from '@angular/router';
import { ShipMethodService } from 'src/app/service/ship-method.service'; // ⬅ import
import { ShipMethod } from 'src/app/types/ship-method';

@Component({
  selector: 'app-orders-list-new',
  templateUrl: './orders-list-new.component.html',
  styleUrls: ['./orders-list-new.component.scss']
})
export class OrdersListNewComponent implements OnInit {
  // Danh sách đơn hàng gốc và được lọc
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Sự kiện đóng modal
  @Output() closeModal = new EventEmitter<void>();

  // Danh sách trạng thái với nhãn tiếng Việt
  statusList = ['TẤT CẢ', 'ĐANG XỬ LÝ', 'ĐÃ XÁC NHẬN', 'ĐANG GIAO', 'HOÀN THÀNH', 'ĐÃ HỦY'];
  selectedStatus = 'TẤT CẢ';
  orderCode: string = '';

  // Trạng thái tải và lỗi
  isLoading = false;
  errorMessage = '';

  constructor(private orderService: OrderService,
    private router: Router,
    private shipMethodService: ShipMethodService // ���️ import
  ) { }

  ngOnInit(): void {
    this.fetchOrdersByUser();
  }

  // Đóng danh sách đơn hàng
  closeOrders() {
    this.closeModal.emit();
  }

  // Chuyển đổi nhãn trạng thái sang tiếng Việt
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ALL': 'Tất cả',
      'PENDING': 'Đang xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'TẤT CẢ': 'Tất cả',
      'ĐANG XỬ LÝ': 'Đang xử lý',
      'ĐÃ XÁC NHẬN': 'Đã xác nhận',
      'ĐANG GIAO': 'Đang giao',
      'HOÀN THÀNH': 'Hoàn thành',
      'ĐÃ HỦY': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  // Lấy danh sách đơn hàng của người dùng
  // Gọi API lấy đơn hàng
  fetchOrdersByUser(): void {
    this.isLoading = true;
    this.orderService.getOrdersByUser().subscribe({
      next: (response) => {
        this.orders = response.map(order => {
          const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
          const isValid = !isNaN(createdAt.getTime());
          console.log('🧾 Order:', order.orderId, '| createdAt:', order.createdAt, '| Parsed:', createdAt, '| Valid:', isValid);
        
          return {
            ...order,
            createdAt: isValid ? createdAt : null
          };
        });
        
        // GỌI shipMethodService CHO MỖI ĐƠN HÀNG
        this.orders.forEach(order => {
          if (order.shipMethodId) {
            // Lấy thông tin shipMethod
            this.shipMethodService.getShipMethodById(order.shipMethodId).subscribe({
              next: (method) => {
                order.shipMethod = method;
              },
              error: (err) => {
              }
            });
          } else {
            order.shipMethod.name = 'Không có';
          }
        });

        // Lưu mảng filteredOrders
        this.filteredOrders = this.orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Lỗi khi tải đơn hàng:', error);
      }
    });
  }
  // Lọc đơn hàng theo mã và trạng thái
  filterOrders(): void {
    const code = this.orderCode.toLowerCase().trim();
    this.filteredOrders = this.orders.filter((order) => {
      // Kiểm tra trạng thái
      const matchesStatus =
        this.selectedStatus === 'TẤT CẢ' ||
        this.getStatusLabel(order.status).toUpperCase() === this.selectedStatus;

      // Kiểm tra mã đơn hàng
      const matchesCode = code
        ? order.orderId.toString().toLowerCase().includes(code)
        : true;

      return matchesStatus && matchesCode;
    });
  }

  // Chọn trạng thái lọc
  onSelectStatus(status: string): void {
    this.selectedStatus = status;
    this.filterOrders();
  }

  // Thay đổi mã đơn hàng
  onOrderCodeChange(): void {
    this.filterOrders();
  }

  // Xem chi tiết đơn hàng
  onViewDetails(order: Order) {
    this.router.navigate(['/order-details-new', order.orderId]);
  }


  parseDate(dateStr: any): string {
    if (!dateStr) {
      console.warn('⚠️ dateStr is null or undefined');
      return 'Không có';
    }
  
    try {
      let date: Date;
  
      if (Array.isArray(dateStr) && dateStr.length >= 6) {
        // Dạng [2025, 4, 16, 2, 22, 21, ...]
        const [year, month, day, hour, minute, second] = dateStr;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (dateStr instanceof Date) {
        date = dateStr;
      } else if (typeof dateStr === 'string' || typeof dateStr === 'number') {
        date = new Date(dateStr);
      } else {
        console.warn('❌ Không hỗ trợ kiểu dữ liệu date:', dateStr);
        return 'Không xác định';
      }
  
      if (isNaN(date.getTime())) {
        console.warn('❌ Giá trị ngày không hợp lệ:', dateStr);
        return 'Không hợp lệ';
      }
  
      const dayStr = date.getDate().toString().padStart(2, '0');
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const yearStr = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
  
      const formatted = `${dayStr}/${monthStr}/${yearStr} ${hours}:${minutes}:${seconds}`;
      console.log('✅ Định dạng thành công:', dateStr, '→', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ Lỗi khi định dạng ngày:', dateStr, '| Error:', error);
      return 'Lỗi';
    }
  }
  
  
}