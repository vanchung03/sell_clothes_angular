import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { Product } from 'src/app/types/products';
import { ProductImage } from 'src/app/types/product-image';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sale-collections',
  templateUrl: './sale-collections.component.html',
  styleUrls: ['./sale-collections.component.scss']
})
export class SaleCollectionsComponent implements OnInit {
  products: Product[] = [];
  productImages: { [key: number]: ProductImage[] } = {};
  currentImageIndex: { [key: number]: number } = {};

  constructor(
    private productService: ProductService,
    private productImageService: ProductImageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }
  // 🟢 Điều hướng sang trang chi tiết sản phẩm
  onViewDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      this.products.forEach(product => {
        this.loadProductImages(product.productId!);
      });
    });
  }

  loadProductImages(productId: number): void {
    this.productImageService.getAllProductImages(productId).subscribe(images => {
      this.productImages[productId] = images;
      if (images.length > 0) {
        this.currentImageIndex[productId] = 0;
        this.startImageRotation(productId);
      }
    });
  }

  startImageRotation(productId: number): void {
    setInterval(() => {
      if (this.productImages[productId] && this.productImages[productId].length > 1) {
        this.currentImageIndex[productId] =
          (this.currentImageIndex[productId] + 1) % this.productImages[productId].length;
      }
    }, 3000);
  }
}
