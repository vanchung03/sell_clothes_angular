import { Component, OnInit } from '@angular/core';
import { VoucherService } from 'src/app/service/voucher.service';
import { Voucher } from 'src/app/types/voucher';
import { ToastrService } from 'ngx-toastr';
import * as AOS from 'aos';

@Component({
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html',
  styleUrls: ['./voucher-list.component.scss']
})
export class VoucherListComponent implements OnInit {
  vouchers: Voucher[] = [];
  isLoading = false;

  constructor(
    private voucherService: VoucherService, 
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Khởi tạo hiệu ứng AOS
    AOS.init({
      once: true,
      offset: 100,
      duration: 800,
      easing: 'ease-in-out',
      delay: 100,
    });
    
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.voucherService.getAllVouchers().subscribe({
      next: (data) => {
        // Sắp xếp voucher: đang hoạt động trước, sắp hết hạn kế tiếp
        this.vouchers = data.sort((a, b) => {
          // Ưu tiên voucher đang hoạt động
          if (a.active && !b.active) return -1;
          if (!a.active && b.active) return 1;
          
          // Nếu cả hai đều hoạt động, ưu tiên theo thời gian hết hạn
          if (a.active && b.active) {
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          }
          
          return 0;
        });
        
        this.isLoading = false;
        setTimeout(() => AOS.refresh(), 500);
      },
      error: (error) => {
        console.error('Lỗi khi tải voucher:', error);
        this.toastr.error('Không thể tải danh sách voucher', 'Lỗi');
        this.isLoading = false;
      }
    });
  }

  copyToClipboard(voucherCode: string): void {
    navigator.clipboard.writeText(voucherCode).then(() => {
      this.toastr.success(`Đã sao chép mã: ${voucherCode}`, 'Thành công', {
        timeOut: 2000,
        positionClass: 'toast-bottom-right',
        progressBar: true
      });
    }).catch((error) => {
      console.error('Lỗi khi sao chép:', error);
      this.toastr.error('Không thể sao chép mã', 'Lỗi');
    });
  }

  isExpired(expiryDate: string | Date): boolean {
    return new Date(expiryDate).getTime() < new Date().getTime();
  }

  // Định dạng số tiền
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  }
}