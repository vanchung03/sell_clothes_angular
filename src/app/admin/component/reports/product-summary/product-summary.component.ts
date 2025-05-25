import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/types/products';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { ProductReviewService } from 'src/app/service/product.review.service';
import { ProductService } from 'src/app/service/product.service';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.scss']
})
export class ProductSummaryComponent implements OnInit {
  products: Product[] = [];
  productData: any[] = [];
  filteredProductData: any[] = [];

  stockOperator: string = '>';
  stockThreshold: number = 10;

  constructor(
    private productService: ProductService,
    private variantService: ProductVariantService,
    private imageService: ProductImageService,
    private reviewService: ProductReviewService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      products.forEach(product => {
        forkJoin({
          variants: this.variantService.getAllVariantsByProductId(product.productId),
          images: this.imageService.getAllProductImages(product.productId),
          reviews: this.reviewService.getReviewsByProductId(product.productId)
        }).subscribe(({ variants, images, reviews }) => {
          const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0;

          const imageStocks = variants
            .filter(v => v.imageUrl)
            .map(v => ({
              imageUrl: v.imageUrl!,
              stockQuantity: v.stockQuantity || 0
            }));

          const summary = {
            productId: product.productId,
            name: product.name,
            totalStock,
            variantCount: variants.length,
            imageCount: images.length,
            reviewCount: reviews.length,
            averageRating: avgRating,
            imageStocks
          };

          this.productData.push(summary);
          this.filteredProductData = [...this.productData]; // ban đầu chưa lọc
        });
      });
    });
  }

  applyFilter(): void {
    this.filteredProductData = this.productData.filter(product => {
      switch (this.stockOperator) {
        case '>': return product.totalStock > this.stockThreshold;
        case '<': return product.totalStock < this.stockThreshold;
        case '=': return product.totalStock === this.stockThreshold;
        default: return true;
      }
    });
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredProductData.map(item => ({
      'Tên sản phẩm': item.name,
      'Tổng tồn kho': item.totalStock,
      'Số biến thể': item.variantCount,
      'Số ảnh': item.imageCount,
      'Số đánh giá': item.reviewCount,
      'Trung bình sao': item.averageRating
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tổng Kho');
    XLSX.writeFile(workbook, 'thong-ke-ton-kho.xlsx');
  }
}
