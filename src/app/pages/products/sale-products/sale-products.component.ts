import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/types/products';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sale-products',
  templateUrl: './sale-products.component.html',
  styleUrls: ['./sale-products.component.scss']
})
export class SaleProductsComponent implements OnInit {
  products: Product[] = [];  // Mảng sản phẩm
  categoryId!: number;       // Lưu ID danh mục

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Lấy categoryId từ query params (VD: ?categoryId=5)
    this.route.queryParams.subscribe(params => {
      this.categoryId = +params['categoryId']; // ép sang number
      if (this.categoryId) {
        this.loadProductsByCategory();
      }
    });
  }

  // Sự kiện khi nhấp "Xem chi tiết"
  onViewDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }

  // Gọi service để lấy sp theo danh mục
  loadProductsByCategory(): void {
    this.productService.getProductsByCategoryId(this.categoryId).subscribe(
      (data) => {
        // Thêm logic tính % giảm giá, ảnh mặc định...
        this.products = data.map((product) => ({
          ...product,
          discount: product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0,
          image: product.thumbnail || 'assets/images/default-product.jpg',
        }));
      },
      (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    );
  }
}
