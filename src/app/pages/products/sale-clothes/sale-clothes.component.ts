import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/types/products';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sale-clothes',
  templateUrl: './sale-clothes.component.html',
  styleUrls: ['./sale-clothes.component.scss'],
})
export class SaleClothesComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  // 🟢 Điều hướng sang trang chi tiết sản phẩm
  onViewDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data.map((product) => ({
          ...product,
          discount: product.salePrice
            ? Math.round(((product.price - product.salePrice) / product.price) * 100)
            : 0,
        }));
        this.filteredProducts = [...this.products]; // Hiển thị mặc định toàn bộ sản phẩm
      },
      (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    );
  }

  sortBy(type: string): void {
    switch (type) {
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        this.filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
        break;
    }
  }
}
