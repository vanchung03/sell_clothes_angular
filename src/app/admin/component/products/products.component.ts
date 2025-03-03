import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from '../../../service/product.service';
import { Product } from '../../../types/products';
import { ToastrService } from 'ngx-toastr';
import { initAOS } from 'src/app/aos-init';
import { Router } from '@angular/router';
// Thư viện xuất Excel
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  // Danh sách các cột hiển thị
  displayedColumns: string[] = [
    'avatarAndInfo',
    'name',
    'priceInfo',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<Product>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    initAOS();
  }
  ngAfterViewInit(): void {
   
    this.dataSource.paginator = this.paginator;
    // Add sorting behavior
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      return data.name.toLowerCase().includes(filter) ||
             data.productId.toString().includes(filter) ||
             data.description?.toLowerCase().includes(filter);
    };
    initAOS();
  }

  getDiscountPercentage(product: Product): number {
    if (!product.salePrice || !product.price) return 0;
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }
  updateStatus(product: Product): void {
    product.status = !product.status;
    // this.productService.updateProduct(product).subscribe(
    //   () => {
    //     this.toastr.success('Cập nhật trạng thái thành công');
    //   },
    //   error => {
    //     product.status = !product.status; // Revert on error
    //     this.toastr.error('Cập nhật trạng thái thất bại');
    //   }
    // );
  }

  getBrandName(brandId: number): string {
    // Implement brand name lookup
    return `Brand ${brandId}`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clearSearch(inputElement: HTMLInputElement) {
    inputElement.value = ''; // Xóa nội dung trong ô nhập
    this.applyFilter({ target: inputElement } as unknown as Event); // Áp dụng bộ lọc với giá trị trống
  }

   // =================================================================
  // ============= HÀM XUẤT EXCEL ====================================
  // =================================================================
  exportToExcel(): void {
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      this.toastr.warning('Không có dữ liệu để xuất!', 'Cảnh báo');
      return;
    }

    try {
      // Chuẩn bị dữ liệu dạng JSON để ghi vào Sheet
      const dataToExport = this.dataSource.data.map((product) => {
        return {
          'ID': product.productId,
          'Tên sản phẩm': product.name,
          'Mô tả': product.description || '',
          'Giá gốc': product.price || 0,
          'Giá sale': product.salePrice || 0,
          'Trạng thái': product.status ? 'Đang bán' : 'Ngừng bán',
        };
      });

      // Tạo Worksheet từ JSON
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

      // Tạo Workbook và gán Worksheet
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_sach_san_pham');

      // Ghi workbook ra buffer
      const excelBuffer: any = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      // Tạo Blob rồi lưu file
      const blobData = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileName = `Danh_sach_san_pham_${new Date().toISOString().slice(0,10)}.xlsx`;

      saveAs(blobData, fileName);

      this.toastr.success('Xuất file Excel thành công!', 'Thành công');
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      this.toastr.error('Không thể xuất Excel', 'Lỗi');
    }
  }

  addProduct() {
    this.router.navigate(['/admin/products']);
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        console.log("Dữ liệu từ API:", products); // Kiểm tra dữ liệu thực tế
        this.dataSource.data = products;
        console.log("Dữ liệu trong bảng:", this.dataSource.data); // Kiểm tra bảng có đúng không
        this.toastr.success('Tải dữ liệu thành công');
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastr.error('Không thể tải dữ liệu sản phẩm');
      }
    });
  }
  
  

  onDeleteProduct(productId: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(productId).subscribe(
        () => {
          this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
          this.loadProducts(); // Cập nhật danh sách sản phẩm sau khi xóa
        },
        (error) => {
          console.error('Lỗi khi xóa sản phẩm:', error);
          this.toastr.error('Xóa sản phẩm thất bại', 'Lỗi');
        }
      );
    }
  }
  
}
