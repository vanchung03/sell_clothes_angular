import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/service/product.service';
import { finalize } from 'rxjs/operators';
import Aos from 'aos';
import { ExcelTemplateService } from 'src/app/service/excel-template.service';
@Component({
  selector: 'app-add-excel-product',
  templateUrl: './add-excel-product.component.html',
  styleUrls: ['./add-excel-product.component.scss']
})
export class AddExcelProductComponent implements OnInit {
  selectedFile: File | null = null;
  selectedImages: File[] = [];
  fileName: string = '';
  imageCount: number = 0;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadComplete: boolean = false;
  uploadSuccess: boolean = false;

  constructor(
    private productService: ProductService, 
    private toastr: ToastrService,
    private excelTemplateService: ExcelTemplateService
  ) {}

  ngOnInit() {
    // Initialize AOS when component loads
    if (typeof Aos !== 'undefined') {
      Aos.init({
        duration: 800,
        once: true
      });
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

  importProducts() {
    if (!this.selectedFile) {
      this.toastr.warning('Vui lòng chọn file Excel!', 'Thông báo');
      return;
    }
  
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.uploadSuccess = false;
  
    this.productService.importProductsFromExcel(this.selectedFile, this.selectedImages)
      .pipe(finalize(() => {
        this.isUploading = false;
        this.uploadComplete = true;
      }))
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
           
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
      
          } else if (event.type === HttpEventType.Response) {
           
            this.uploadProgress = 100;
            this.uploadSuccess = true;
            this.toastr.success('Nhập sản phẩm thành công!', 'Thành công');
            
          }
        },
        error: (error) => {
          this.isUploading = false;
          this.uploadSuccess = false;
          this.uploadComplete = true;
          this.uploadProgress = 0; // Reset progress khi lỗi
          this.toastr.error('Lỗi khi nhập sản phẩm!', 'Thất bại');
        
        }
      });
  }

  downloadTemplate() {
    this.excelTemplateService.downloadProductTemplate().subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Product_Template.xlsx';
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