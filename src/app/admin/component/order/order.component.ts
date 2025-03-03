import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/service/order.service';
import { PaymentService } from 'src/app/service/payment.service';
import { Order } from 'src/app/types/order';
import { Payment } from 'src/app/types/payment';
import { initAOS } from 'src/app/aos-init';
// ===== Import cho xuất Excel =====
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-order-list',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  payments: { [key: number]: Payment } = {};
  selectedStatus: string = '';
  selectedPaymentMethod: string = '';
  searchTerm: string = '';
  statusOptions = [
    { value: '', label: 'Tất cả trạng thái', icon: 'fa-filter' },
    { value: 'PENDING', label: 'Chờ xử lý', icon: 'fa-clock' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', icon: 'fa-check' },
    { value: 'SHIPPING', label: 'Đang giao', icon: 'fa-truck' },
    { value: 'COMPLETED', label: 'Hoàn thành', icon: 'fa-check-circle' },
    { value: 'CANCELLED', label: 'Đã hủy', icon: 'fa-times-circle' }
  ];

  paymentMethods = [
    { value: '', label: 'Tất cả phương thức', icon: 'fa-money-bill' },
    { value: 'COD', label: 'Tiền mặt (COD)', icon: 'fa-money-bill' },
    { value: 'VNPAY', label: 'VN Pay', icon: 'fa-credit-card' },
    { value: 'MOMO', label: 'Momo', icon: 'fa-wallet' },
    { value: 'PAYPAL', label: 'PayPal', icon: 'fa-paypal' }
  ];
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    initAOS();
    this.loadOrders();
  }

  getStatusColor(status: string): string {
    const colors = {
      'PENDING': '#f39c12',
      'CONFIRMED': '#3498db',
      'SHIPPING': '#9b59b6',
      'COMPLETED': '#2ecc71',
      'CANCELLED': '#e74c3c'
    };
    return colors[status] || '#666';
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe(data => {
      this.orders = data;
      this.filteredOrders = data;
      this.orders.forEach(order => this.loadPayment(order.orderId));
    });
  }
  getPaymentStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'CHỜ THANH TOÁN',
      'COMPLETED': 'ĐÃ THANH TOÁN',
      'FAILED': 'THANH TOÁN THẤT BẠI',
      'REFUNDED': 'ĐÃ HOÀN TIỀN'
    };
    return statusMap[status] || 'N/A';
  } 

  loadPayment(orderId: number): void {
    this.paymentService.getPaymentByOrderId(orderId).subscribe(payment => {
      this.payments[orderId] = payment;
    });
  }

  getTotalAmount(): number {
    return this.filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm || 
        order.orderId.toString().includes(this.searchTerm.toLowerCase()) ||
        order.userId.toString().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.selectedStatus || 
        order.status === this.selectedStatus;

      const matchesPayment = !this.selectedPaymentMethod || 
        this.payments[order.orderId]?.method === this.selectedPaymentMethod;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }
  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (response) => {
        // Handle success
        console.log('Order status updated successfully');
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        // Revert the status change in UI
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
          order.status = status;
        }
      }
    });
  }
  printOrder(order: Order): void {
    // Implement print functionality
    console.log('Printing order:', order);
    window.print();
  }
  // ===============================================
  // =============== XUẤT EXCEL ====================
  // ===============================================
  exportToExcel(): void {
    if (!this.filteredOrders || this.filteredOrders.length === 0) {
      // Không có dữ liệu cần xuất
      console.warn('Không có đơn hàng để xuất Excel!');
      return;
    }

    try {
      // Chuẩn bị dữ liệu dạng JSON để xuất
      const dataToExport = this.filteredOrders.map(order => {
        const payment = this.payments[order.orderId];
        return {
          'Mã Đơn': `#${order.orderId}`,
          'Khách hàng (UserId)': `#${order.userId}`,
          'Tổng tiền': order.totalAmount ?? 0,
          'Trạng thái': order.status,
          'Phương thức TT': payment?.method || 'N/A',
          'TT Thanh Toán': this.getPaymentStatusText(payment?.paymentStatus || '')
        };
      });

      // Tạo Worksheet từ JSON
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

      // Tạo Workbook và nối Worksheet
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đơn hàng');

      // Ghi workbook ra buffer
      const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Tạo Blob rồi lưu file
      const blobData = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Tên file xuất
      const fileName = `Danh_sach_don_hang_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blobData, fileName);

      console.log('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
    }
  }
}
