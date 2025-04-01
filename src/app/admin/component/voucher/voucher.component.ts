import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VoucherService } from 'src/app/service/voucher.service';
import { Voucher } from 'src/app/types/voucher';
import { ToastrService } from 'ngx-toastr';
import * as AOS from 'aos';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.scss']
})
export class VoucherComponent implements OnInit {
  vouchers: Voucher[] = [];
  filteredVouchers: Voucher[] = [];
  voucherForm: FormGroup;
  isEditing = false;
  currentVoucherId: number | null = null;
  searchTerm = '';
  isLoading = false;
  modalVisible = false;

  constructor(
    private voucherService: VoucherService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.voucherForm = this.fb.group({
      voucherCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      discountAmount: [null, [Validators.required, Validators.min(1)]],
      discountType: ['PERCENTAGE', Validators.required],
      maxDiscount: [null],
      expiryDate: [null, Validators.required],
      active: [true],
      quantity: [10, [Validators.required, Validators.min(1), Validators.max(100)]], // ✅ Thêm số lượng (Giới hạn 1 - 100)
    });
  }

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
    this.loadVouchers();
    
    // Add conditional validator for maxDiscount
    this.voucherForm.get('discountType')?.valueChanges.subscribe(type => {
      const maxDiscountControl = this.voucherForm.get('maxDiscount');
      if (type === 'PERCENTAGE') {
        maxDiscountControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        maxDiscountControl?.clearValidators();
        maxDiscountControl?.setValue(null);
      }
      maxDiscountControl?.updateValueAndValidity();
    });
  }

  loadVouchers(): void {
    this.isLoading = true;
    this.voucherService.getAllVouchers().subscribe({
      next: (data) => {
        this.vouchers = data;
        this.filteredVouchers = [...this.vouchers];
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách voucher', 'Lỗi');
        console.error('Error loading vouchers:', error);
        this.isLoading = false;
      }
    });
  }

  openModal(voucher?: Voucher): void {
    this.modalVisible = true;
    if (voucher) {
      // Edit mode
      this.isEditing = true;
      this.currentVoucherId = voucher.voucherId;
      
      // Format date for input
      const expiryDate = voucher.expiryDate instanceof Date 
        ? voucher.expiryDate 
        : new Date(voucher.expiryDate);
      
      const formattedDate = expiryDate.toISOString().split('T')[0];
      
      this.voucherForm.setValue({
        voucherCode: voucher.voucherCode,
        discountAmount: voucher.discountAmount,
        discountType: voucher.discountType,
        maxDiscount: voucher.maxDiscount || null,
        expiryDate: formattedDate,
        active: voucher.active,
        quantity: voucher.quantity,
      });
    } else {
      // Add mode
      this.isEditing = false;
      this.currentVoucherId = null;
      this.voucherForm.reset({
        discountType: 'PERCENTAGE',
        active: true,
        
      });
    }
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  searchVouchers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVouchers = [...this.vouchers];
      return;
    }
    
    const search = this.searchTerm.toLowerCase().trim();
    this.filteredVouchers = this.vouchers.filter(voucher => 
      voucher.voucherCode.toLowerCase().includes(search) ||
      voucher.discountAmount.toString().includes(search)
    );
  }

  saveVoucher(): void {
    if (this.voucherForm.invalid) {
      this.markFormGroupTouched(this.voucherForm);
      this.toastr.warning('Vui lòng điền đầy đủ thông tin voucher', 'Cảnh báo');
      return;
    }
  
    // Chuyển đổi ngày thành định dạng phù hợp trước khi gửi API
    const formData = this.voucherForm.value;
    const expiryDate = new Date(formData.expiryDate);
    formData.expiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' '); // yyyy-MM-dd HH:mm:ss
  
    this.isLoading = true;
  
    if (this.isEditing && this.currentVoucherId) {
      this.voucherService.updateVoucher(this.currentVoucherId, formData).subscribe({
        next: (updatedVoucher) => {
          const index = this.vouchers.findIndex(v => v.voucherId === this.currentVoucherId);
          if (index !== -1) {
            this.vouchers[index] = updatedVoucher;
            this.filteredVouchers = [...this.vouchers];
          }
          this.toastr.success('Voucher đã được cập nhật thành công', 'Thành công');
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error('Không thể cập nhật voucher', 'Lỗi');
          console.error('Error updating voucher:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.voucherService.createVoucher(formData).subscribe({
        next: (newVoucher) => {
          this.vouchers.unshift(newVoucher);
          this.filteredVouchers = [...this.vouchers];
          this.toastr.success('Voucher đã được tạo thành công', 'Thành công');
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error('Không thể tạo voucher', 'Lỗi');
          console.error('Error creating voucher:', error);
          this.isLoading = false;
        }
      });
    }
  }
  

  deleteVoucher(voucherId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      this.isLoading = true;
      this.voucherService.deleteVoucher(voucherId).subscribe({
        next: () => {
          this.vouchers = this.vouchers.filter(v => v.voucherId !== voucherId);
          this.filteredVouchers = this.filteredVouchers.filter(v => v.voucherId !== voucherId);
          this.toastr.success('Voucher đã được xóa thành công', 'Thành công');
          this.isLoading = false;
        },
        error: (error) => {
          this.toastr.error('Không thể xóa voucher', 'Lỗi');
          console.error('Error deleting voucher:', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Format display date
  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  // Format discount display
  formatDiscount(voucher: Voucher): string {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountAmount}% (Tối đa: ${voucher.maxDiscount?.toLocaleString() || 0} đ)`;
    }
    return `${voucher.discountAmount.toLocaleString()} đ`;
  }
}