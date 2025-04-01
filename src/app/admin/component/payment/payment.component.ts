import { Component, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/service/payment.service';
import { Payment } from 'src/app/types/payment';
import { initAOS } from 'src/assets/aos-init';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  payments: Payment[] = []; // Danh sách gốc từ API
  filteredPayments: Payment[] = []; // Danh sách sau khi lọc
  searchTransactionCode: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(private paymentService: PaymentService) {}

  

  // ✅ Lấy tất cả thanh toán từ API
  loadAllPayments(): void {
    this.paymentService.getAllPayments().subscribe(
      (data) => {
        this.payments = data.map(payment => {
          const convertedCreatedAt = this.parseDate(payment.createdAt);
          const convertedUpdatedAt = this.parseDate(payment.updatedAt);
          return {
            ...payment,
            createdAt: convertedCreatedAt,
            updatedAt: convertedUpdatedAt,
            transactionCode: payment.transactionCode || "N/A" 
          };
        });
        this.filteredPayments = [...this.payments];
      },
      (error) => {
        console.error(' Lỗi khi lấy danh sách thanh toán:', error);
      }
    );
  }
  
  
  parseDate(dateStr: any): string {
    
    if (!dateStr) {
      return "N/A";
    }
    if (dateStr instanceof Date) {
      return dateStr.toISOString();
    }
    if (typeof dateStr === "number") {
      return new Date(dateStr).toISOString();
    }
    if (Array.isArray(dateStr) && dateStr.length >= 6) {
      console.log("✅ Chuyển đổi mảng thành Date:", dateStr);
      return new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3], dateStr[4], dateStr[5], dateStr[6] || 0).toISOString();
    }
    if (typeof dateStr === "string" && !isNaN(Date.parse(dateStr))) {
      return new Date(dateStr).toISOString();
    }
    return "N/A";
  }
  // ✅ Lọc thanh toán theo mã & khoảng thời gian
  statusFilter: string = 'all';
  methodFilter: string = 'all';
  sortDirection: 'asc' | 'desc' = 'desc';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalAmount: number = 0;

  paymentMethods = [
    { value: 'all', label: 'Tất cả' },
    { value: 'VNPAY', label: 'VN Pay' },
    { value: 'PAYPAL', label: 'Paypal' },

    { value: 'COD', label: 'Tiền mặt' },
    { value: 'MOMO', label: 'Momo' }
  ];

  paymentStatuses = [
    { value: 'all', label: 'Tất cả' },
    { value: 'PENDING', label: 'Chờ thanh toán' },
    { value: 'FAILED', label: 'Thanh toán thất bại' }, 
    { value: 'COMPLETED', label: 'Đã thanh toán' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' }
  ];

  ngOnInit(): void {
    initAOS();
    this.loadAllPayments();
  }

  // Enhance filter method
  filterPayments(): void {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesTransactionCode = this.searchTransactionCode ? 
        payment.transactionCode?.toLowerCase().includes(this.searchTransactionCode.toLowerCase()) : true;

      const paymentDate = new Date(payment.createdAt);
      const matchesStartDate = this.startDate ? paymentDate >= new Date(this.startDate) : true;
      const matchesEndDate = this.endDate ? paymentDate <= new Date(this.endDate) : true;
      
      
      const matchesStatus = this.statusFilter === 'all' ? true : 
        payment.paymentStatus === this.statusFilter;
      
      const matchesMethod = this.methodFilter === 'all' ? true :
        payment.method === this.methodFilter;

      return matchesTransactionCode && matchesStartDate && 
             matchesEndDate && matchesStatus && matchesMethod;
    });

    // Calculate total amount
    this.totalAmount = this.filteredPayments.reduce((sum, payment) => 
      sum + (payment.amount || 0), 0);
  }

  // Add new methods
  sortByDate(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.filteredPayments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  resetFilters(): void {
    this.searchTransactionCode = '';
    this.startDate = '';
    this.endDate = '';
    this.statusFilter = 'all';
    this.methodFilter = 'all';
    this.filteredPayments = [...this.payments];
  }

  // ✅ Sao chép mã giao dịch vào clipboard
  copyToClipboard(transactionCode: string): void {
    navigator.clipboard.writeText(transactionCode).then(() => {
     
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
    });
  }

  // ✅ Xuất dữ liệu thanh toán đã lọc ra Excel
  exportToExcel(): void {
    if (!this.filteredPayments || this.filteredPayments.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }
    this.paymentService.exportToExcel(this.filteredPayments);
  }
}
