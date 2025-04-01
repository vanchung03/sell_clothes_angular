import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../service/product.service';
import { Product } from '../../../types/products';

// Import thêm Brand, Category và 2 service
import { Brand } from '../../../types/brand';
import { Category } from '../../../types/category';
import { BrandService } from '../../../service/brand.service';
import { CategoryService } from '../../../service/category.service';
import * as AOS from 'aos';
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card-all.component.html',
  styleUrls: ['./product-card-all.component.scss']
})
export class ProductCardComponent implements OnInit {
  // =============== TRẠNG THÁI HIỂN THỊ ===============
  displayStyle: 'grid' | 'list' = 'grid';
  loading = false;
  error: string | null = null;

  // =============== DANH SÁCH SẢN PHẨM ===============
  /** Lưu toàn bộ sản phẩm tải về từ server */
  allProducts: Product[] = [];
  /** Mảng hiển thị sau khi lọc/sắp xếp */
  products: Product[] = [];

  // =============== QUICK VIEW ===============
  showQuickView = false;
  selectedProduct: Product | null = null;

  // =============== BIẾN LỌC ===============
  selectedPrice: string = '';
  selectedBrandId: number | '' = '';
  selectedCategoryId: number | '' = '';
  selectedStyle: string = '';
  selectedSize: string = '';
  selectedColor: string = '';
  selectedShipping: string = '';

  // Dữ liệu brand, category lấy từ service
  brandList: Brand[] = [];
  categoryList: Category[] = [];

  // Giá giả lập
  priceList = [
    { value: 'under-200',  label: 'Dưới 200.000₫' },
    { value: '200-500',    label: '200.000₫ - 500.000₫' },
    { value: '500-1000',   label: '500.000₫ - 1.000.000₫' },
    { value: 'above-1000', label: 'Trên 1.000.000₫' }
  ];

  // Một số list mẫu
  styleList = ['Casual', 'Sport', 'Formal'];
  sizeList = ['S', 'M', 'L', 'XL'];
  colorList = ['Trắng', 'Đen', 'Xanh', 'Đỏ'];
  shippingList = ['Giao nhanh', 'Giao tiêu chuẩn'];

  // =============== SẮP XẾP ===============
  currentSort: string = '';
  sortOptions = [
    { value: 'name-asc',      label: 'Tên A-Z' },
    { value: 'name-desc',     label: 'Tên Z-A' },
    { value: 'lowest-price',  label: 'Giá thấp đến cao' },
    { value: 'highest-price', label: 'Giá cao đến thấp' }
  ];

  constructor(
    private router: Router,
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
    this.loadProducts();
    this.loadBrands();
    this.loadCategories();
  }

  // =============== LẤY SẢN PHẨM ===============
  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.allProducts = products;   // Lưu toàn bộ
        this.products = products;      // Ban đầu hiển thị tất cả
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Không thể tải danh sách sản phẩm!';
        this.loading = false;
      }
    });
  }

  // =============== LẤY BRAND ===============
  loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brandList = brands;
      },
      error: (err) => {
        console.error('Error loading brands:', err);
      }
    });
  }

  // =============== LẤY CATEGORY ===============
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categoryList = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  // =============== FILTER CLIENT-SIDE ===============
  onFilterChange(): void {
    // Sao chép toàn bộ sản phẩm trước khi lọc
    let filtered = [...this.allProducts];

    // Lọc theo brand
    if (this.selectedBrandId) {
      filtered = filtered.filter(p => p.brandId === +this.selectedBrandId);
    }
    // Lọc theo category
    if (this.selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === +this.selectedCategoryId);
    }
    // Lọc theo giá
    if (this.selectedPrice) {
      filtered = filtered.filter(product => {
        if (!product.salePrice) return false;
        const price = product.salePrice;

        switch (this.selectedPrice) {
          case 'under-200':
            return price < 200000;
          case '200-500':
            return price >= 200000 && price <= 500000;
          case '500-1000':
            return price > 500000 && price <= 1000000;
          case 'above-1000':
            return price > 1000000;
          default:
            return true;
        }
      });
    }
    // Lọc theo style, size, color, shipping (tùy logic thực tế)
    if (this.selectedStyle) {
      // Ví dụ minh họa
      filtered = filtered.filter(p => p.description?.includes(this.selectedStyle));
    }
    if (this.selectedSize) {
      // ...
    }
    if (this.selectedColor) {
      // ...
    }
    if (this.selectedShipping) {
      // ...
    }

    this.products = filtered;
  }

  getDiscountPercentage(product: Product): number {
    // Tính % = (price - salePrice)/price * 100
    if (product.price && product.salePrice && product.salePrice < product.price) {
      return Math.round(((product.price - product.salePrice) / product.price) * 100);
    }
    return 0;
  }
  

  // =============== SẮP XẾP TRONG MẢNG ===============
  onSortChange(sortValue: string): void {
    this.currentSort = sortValue;
    this.products.sort((a, b) => {
      const priceA = a.salePrice || a.price || 0;
      const priceB = b.salePrice || b.price || 0;

      switch (sortValue) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'lowest-price':
          return priceA - priceB;
        case 'highest-price':
          return priceB - priceA;
        default:
          return 0;
      }
    });
  }

  // =============== QUICK VIEW, CHI TIẾT ===============
  toggleQuickView(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.selectedProduct = product;
    this.showQuickView = !this.showQuickView;
  }

  onViewDetail(productId: number): void {
    this.router.navigate(['/product-detail', productId]);
  }

  goToDetail(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/product', product.productId]);
  }

  // =============== YÊU THÍCH ===============
  toggleFavorite(product: Product, event?: Event): void {
    if (event) event.stopPropagation();
    product.isFavorite = !product.isFavorite;
    // Gọi service lưu nếu muốn
  }

  // =============== GIẢM GIÁ ===============
  
  isProductOnSale(product: Product): boolean {
    return !!product.salePrice && product.salePrice < product.price;
  }

  onResetFilter(): void {
    // Đưa toàn bộ filter về giá trị mặc định
    this.selectedPrice = '';
    this.selectedBrandId = '';
    this.selectedCategoryId = '';
    this.selectedStyle = '';
    this.selectedSize = '';
    this.selectedColor = '';
    this.selectedShipping = '';
  
    // Gọi lại hàm onFilterChange() để áp dụng
    this.onFilterChange();
  }
  
}
