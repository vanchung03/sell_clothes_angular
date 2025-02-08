import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService, Product } from '../../../service/product.service';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/service/token.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  // Danh sách các cột hiển thị (phải khớp với template)
  displayedColumns: string[] = [
    'productId',
    'brandId',
    'name',
    'description',
    'price',
    'salePrice',
    'thumbnail',
    'status',
    // 'createdAt',
    // 'updatedAt',
    'actions'
  ];

  // Sử dụng MatTableDataSource để hỗ trợ phân trang, lọc, …  
  dataSource = new MatTableDataSource<Product>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private tokenService: TokenService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load danh sách sản phẩm từ API và thiết lập phân trang
  loadProducts(): void {
      // Log refreshToken
    this.tokenService.logRefreshToken();
    this.productService.getAllProducts().subscribe(
      (data: Product[]) => {
        this.dataSource.data = data;
        // Gán paginator sau khi data đã được load
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        });
        console.log('Danh sách sản phẩm:', data);
      },
      (error) => {
        console.error('Lỗi khi lấy sản phẩm:', error);
        this.toastr.error('Lỗi khi tải dữ liệu sản phẩm', 'Lỗi');
      }
    );
  }

  // Xóa sản phẩm
  onDelete(id: number): void {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
          // Sau khi xóa thành công, load lại danh sách sản phẩm
          this.loadProducts();
        },
        (error) => {
          console.error('Lỗi khi xóa sản phẩm:', error);
          this.toastr.error('Xóa sản phẩm thất bại', 'Lỗi');
        }
      );
    }
  }

  // Chỉnh sửa sản phẩm
  onEdit(product: Product): void {
    console.log('Chỉnh sửa sản phẩm:', product);
    this.toastr.info('Chức năng chỉnh sửa đang được phát triển', 'Thông báo');

  }
}
