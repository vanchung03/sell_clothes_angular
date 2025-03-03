import { Component, OnInit } from '@angular/core';
import { PaymentHistoryService } from 'src/app/service/payment-history.service';
import { PaymentHistory } from 'src/app/types/payment-history';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  paymentHistories: PaymentHistory[] = []; // Danh sách gốc từ API
  filteredHistories: PaymentHistory[] = []; // Danh sách sau khi lọc
  searchTransactionCode: string = '';
  startDate: string = '';
  endDate: string = '';

  constructor(private paymentHistoryService: PaymentHistoryService) {}

  ngOnInit(): void {
    this.loadAllPaymentHistories();
  }

   // ✅ Lấy tất cả giao dịch
   loadAllPaymentHistories(): void {
    this.paymentHistoryService.getAllPaymentHistories().subscribe(
      (data) => {
        this.paymentHistories = data;
        this.filteredHistories = data; // Ban đầu hiển thị tất cả
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách giao dịch:', error);
      }
    );
  }
  copyToClipboard(transactionCode: string): void {
    navigator.clipboard.writeText(transactionCode).then(() => {
      
    }).catch(err => {
      console.error('Lỗi khi sao chép:', err);
    });
  }
  filterPaymentHistories(): void {
    this.filteredHistories = this.paymentHistories.filter(history => {
      const matchesTransactionCode = this.searchTransactionCode
        ? history.transactionCode && history.transactionCode.includes(this.searchTransactionCode)
        : true;
  
      const historyDate = new Date(history.createdAt);
      const matchesStartDate = this.startDate ? historyDate >= new Date(this.startDate) : true;
      const matchesEndDate = this.endDate ? historyDate <= new Date(this.endDate) : true;
  
      return matchesTransactionCode && matchesStartDate && matchesEndDate;
    });
  }
  
  // ✅ Xuất dữ liệu đã lọc ra Excel
  exportToExcel(): void {
    this.paymentHistoryService.exportToExcel(this.filteredHistories);
  }

  // ✅ Xóa một giao dịch
  deletePaymentHistory(historyId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      this.paymentHistoryService.deletePaymentHistory(historyId).subscribe(
        () => {
          this.filteredHistories = this.filteredHistories.filter(h => h.historyId !== historyId);
          this.paymentHistories = this.paymentHistories.filter(h => h.historyId !== historyId);
          alert('Đã xóa giao dịch thành công!');
        },
        (error) => {
          console.error('Lỗi khi xóa giao dịch:', error);
          alert('Xóa giao dịch thất bại!');
        }
      );
    }
  }
  
}
