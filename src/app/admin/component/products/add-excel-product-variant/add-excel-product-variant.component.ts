import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { finalize, timer, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import Aos from 'aos';

@Component({
  selector: 'app-add-excel-product-variant',
  templateUrl: './add-excel-product-variant.component.html',
  styleUrls: ['./add-excel-product-variant.component.scss']
})
export class AddExcelProductVariantComponent implements OnInit {
  selectedFile: File | null = null;
  selectedImages: File[] = [];
  fileName: string = '';
  imageCount: number = 0;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadComplete: boolean = false;
  uploadSuccess: boolean = false;

  // Subscription cho progress timer
  private progressTimerSub: Subscription | null = null;

  constructor(
    private productVariantService: ProductVariantService, 
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    Aos.init({ duration: 800, once: true });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile ? this.selectedFile.name : '';
  }

  onFolderSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
    this.imageCount = this.selectedImages.length;
  }

  resetForm() {
    this.selectedFile = null;
    this.selectedImages = [];
    this.fileName = '';
    this.imageCount = 0;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.uploadComplete = false;
    this.uploadSuccess = false;
    if (this.progressTimerSub) {
      this.progressTimerSub.unsubscribe();
    }
  }

  importProductVariants() {
    if (!this.selectedFile) {
      this.toastr.warning('Vui lòng chọn file Excel!', 'Thông báo');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.uploadSuccess = false;

    // Simulated progress timer: tăng uploadProgress dần đến 95%
    this.progressTimerSub = timer(0, 500).subscribe(() => {
      if (this.uploadProgress < 95) {
        this.uploadProgress += 5;
      }
    });

    this.productVariantService.importProductVariantFromExcel(this.selectedFile, this.selectedImages)
      .pipe(
        finalize(() => {
          // Dừng timer khi upload hoàn thành
          if (this.progressTimerSub) {
            this.progressTimerSub.unsubscribe();
          }
          this.isUploading = false;
          this.uploadComplete = true;
        }),
        catchError(error => {
          if (this.progressTimerSub) {
            this.progressTimerSub.unsubscribe();
          }
          this.isUploading = false;
          this.uploadSuccess = false;
          this.uploadProgress = 0;
          this.uploadComplete = true;
          this.toastr.error('Lỗi khi nhập biến thể sản phẩm!', 'Thất bại');
          return of(error);
        })
      )
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          // Nếu backend gửi sự kiện UploadProgress, cập nhật progress chính xác
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          // Khi nhận được Response, đặt progress = 100%
          this.uploadProgress = 100;
          this.uploadSuccess = true;
          this.toastr.success('Nhập biến thể sản phẩm thành công!', 'Thành công');
          console.log('✅ Import thành công:', event.body);
        }
      });
  }

  downloadTemplate() {
    this.productVariantService.downloadProductVariantTemplate().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ProductVariant_Template.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Tải xuống file template thành công!', 'Thành công');
      },
      error: () => {
        this.toastr.error('Lỗi khi tải file template!', 'Thất bại');
      }
    });
  }
}
