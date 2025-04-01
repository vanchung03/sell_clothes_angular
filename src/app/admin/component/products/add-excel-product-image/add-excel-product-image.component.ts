import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProductImageService } from 'src/app/service/product-image.service';
import { finalize } from 'rxjs/operators';
import Aos from 'aos';

@Component({
  selector: 'app-add-excel-product-image',
  templateUrl: './add-excel-product-image.component.html',
  styleUrls: ['./add-excel-product-image.component.scss']
})
export class AddExcelProductImageComponent implements OnInit {
  selectedFile: File | null = null;
  selectedImages: File[] = [];
  fileName: string = '';
  imageCount: number = 0;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadComplete: boolean = false;
  uploadSuccess: boolean = false;

  constructor(
    private productImageService: ProductImageService, 
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    if (typeof Aos !== 'undefined') {
      Aos.init({ duration: 800, once: true });
    }
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
  }

  importProductImages() {
    if (!this.selectedFile) {
      this.toastr.warning('Vui lòng chọn file Excel!', 'Thông báo');
      return;
    }
  
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.uploadSuccess = false;
  
    this.productImageService.importProductImagesFromExcel(this.selectedFile, this.selectedImages)
      .pipe(finalize(() => {
        this.isUploading = false;
        this.uploadComplete = true;
      }))
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            // ✅ Cập nhật tiến trình upload (nếu có)
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
            console.log(`📤 Upload Progress: ${this.uploadProgress}%`);
          } else if (event.type === HttpEventType.Response) {
            // ✅ Khi API trả về kết quả thành công
            this.uploadProgress = 100; // Đảm bảo thanh tiến trình đạt 100%
            this.uploadSuccess = true;
            this.toastr.success('Nhập ảnh sản phẩm thành công!', 'Thành công');
            console.log('✅ Import thành công:', event.body);
          }
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadSuccess = false;
          this.uploadComplete = true;
          this.uploadProgress = 0; // Reset progress khi lỗi
          this.toastr.error('Lỗi khi nhập ảnh sản phẩm!', 'Thất bại');
          console.error('🚨 Import thất bại:', error);
        }
      });
  }
  

  downloadTemplate() {
    this.productImageService.downloadProductImageTemplate().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ProductImage_Template.xlsx';
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
