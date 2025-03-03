import { Component, OnInit } from '@angular/core';
import { Product } from '../../../types/products';
import { Router } from '@angular/router';
import { ProductService } from '../../../service/product.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  products: Product[] = [];
  displayStyle: 'grid' | 'list' = 'grid';
  loading = false;
  error: string | null = null;
  showQuickView = false;
  selectedProduct: Product | null = null;
  
  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  toggleQuickView(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProduct = product;
    this.showQuickView = !this.showQuickView;
  }

  goToDetail(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/product', product.productId]);
  }

  toggleFavorite(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    product.isFavorite = !product.isFavorite;
    // Implement favorite logic here
  }

  getDiscountPercentage(product: Product): number {
    if (product.price && product.salePrice) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  }

  isProductOnSale(product: Product): boolean {
    return !!product.salePrice && product.salePrice < product.price;
  }
}