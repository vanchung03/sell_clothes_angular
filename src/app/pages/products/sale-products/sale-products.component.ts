import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/types/products';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sale-products',
  templateUrl: './sale-products.component.html',
  styleUrls: ['./sale-products.component.scss']
})
export class SaleProductsComponent implements OnInit {
  products: Product[] = [];
  categoryId!: number;

  constructor(private productService: ProductService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Lấy categoryId từ URL
    this.route.queryParams.subscribe(params => {
      this.categoryId = +params['categoryId']; // Chuyển sang số
      if (this.categoryId) {
        this.loadProductsByCategory();
      }
    });
  }

  loadProductsByCategory(): void {
    this.productService.getProductsByCategoryId(this.categoryId).subscribe(
      (data) => {
        this.products = data.map((product) => ({
          ...product,
          discount: product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0, // Tính % giảm giá nếu có
          image: product.thumbnail || 'assets/images/default-product.jpg', // Ảnh chính
        }));
      },
      (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    );
  }
}
