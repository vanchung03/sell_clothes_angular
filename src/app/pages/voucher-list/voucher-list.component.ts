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
  showVouchers = false;

  constructor(
    private voucherService: VoucherService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    AOS.init({ once: true, offset: 100, duration: 800, easing: 'ease-in-out', delay: 100 });
  }

  toggleVouchers(): void {
    this.showVouchers = !this.showVouchers;
    if (this.showVouchers && this.vouchers.length === 0) {
      this.loadVouchers();
    }
    setTimeout(() => AOS.refresh(), 300);
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.voucherService.getAllVouchers().subscribe({
      next: (data) => {
        this.vouchers = data.sort((a, b) => {
          if (a.active && !b.active) return -1;
          if (!a.active && b.active) return 1;
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
        timeOut: 2000, positionClass: 'toast-bottom-right', progressBar: true
      });
    }).catch((error) => {
      console.error('Lỗi khi sao chép:', error);
      this.toastr.error('Không thể sao chép mã', 'Lỗi');
    });
  }

  isExpired(expiryDate: string | Date): boolean {
    return new Date(expiryDate).getTime() < new Date().getTime();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
}
