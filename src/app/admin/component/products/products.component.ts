import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from '../../../service/product.service';
import { Product } from '../../../types/products';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  // Danh sách các cột hiển thị
  displayedColumns: string[] = [
    'avatarAndInfo', // Tên cột phải khớp với matColumnDef
    'name',
    'description',
    'price',
    'salePrice',
    'status',
    'actions',
  ];

  dataSource = new MatTableDataSource<Product>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Gán paginator sau khi view được khởi tạo
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clearSearch(inputElement: HTMLInputElement) {
    inputElement.value = ''; // Xóa nội dung trong ô nhập
    this.applyFilter({ target: inputElement } as unknown as Event); // Áp dụng bộ lọc với giá trị trống
  }

  exportToExcel() {
    // Logic xuất file Excel, có thể sử dụng thư viện như xlsx
    console.log('Xuất file Excel!');
  }

  addProduct() {
    // Điều hướng hoặc mở dialog thêm sản phẩm
    console.log('Thêm sản phẩm!');
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.dataSource.data = data;
        this.toastr.success('Tải dữ liệu sản phẩm thành công !', 'Thành công');
        console.log('Danh sách sản phẩm:', data);
      },
      (error) => {
        console.error('Lỗi khi lấy sản phẩm:', error);
        this.toastr.error('Lỗi khi tải dữ liệu sản phẩm', 'Lỗi');
      }
    );
  }

  onDelete(id: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
          this.loadProducts();
        },
        (error) => {
          console.error('Lỗi khi xóa sản phẩm:', error);
          this.toastr.error('Xóa sản phẩm thất bại', 'Lỗi');
        }
      );
    }
  }

  onEdit(product: Product): void {
    console.log('Chỉnh sửa sản phẩm:', product);
    this.toastr.info('Chức năng chỉnh sửa đang được phát triển', 'Thông báo');
  }
}
