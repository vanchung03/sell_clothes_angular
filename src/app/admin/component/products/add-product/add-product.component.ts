import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { initAOS } from 'src/assets/aos-init';

// Services
import { ProductService } from 'src/app/service/product.service';
import { BrandService } from 'src/app/service/brand.service';
import { CategoryService } from 'src/app/service/category.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { CloudinaryService } from 'src/app/service/cloudinary.service';

// Interfaces
import { Product } from 'src/app/types/products';
import { ProductImage } from 'src/app/types/product-image';
import { ProductVariant } from 'src/app/types/product-variant';
import { Brand } from 'src/app/types/brand';
import { Category } from 'src/app/types/category';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, OnDestroy {
  // Form Controls
  productForm!: FormGroup;
  imagesForm!: FormArray;
  variantsForm!: FormArray;

  // Component State
  isLoading = false;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  // Data Collections
  categories: Category[] = [];
  brands: Brand[] = [];

  // Constants
  readonly availableColors = ['Đỏ', 'Xanh', 'Be', 'Nâu', 'Vàng', 'Đen', 'Trắng', 'Cam', 'Hồng', 'Xám'];
  readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cloudinaryService: CloudinaryService,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    initAOS();
    this.buildProductForm();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildProductForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.min(0)]],
      thumbnail: ['', Validators.required],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      status: [true],
      images: this.fb.array([this.createImageFormGroup()]),
      variants: this.fb.array([this.createVariantFormGroup()])
    });

    this.imagesForm = this.productForm.get('images') as FormArray;
    this.variantsForm = this.productForm.get('variants') as FormArray;
  }

  private loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      categories: this.categoryService.getAllCategories(),
      brands: this.brandService.getAllBrands()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.brands = data.brands;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.toastr.error('Không thể tải dữ liệu ban đầu');
        this.isLoading = false;
      }
    });
  }

  // Form Array Methods
  private createImageFormGroup(): FormGroup {
    return this.fb.group({
      imageUrl: ['', Validators.required],
      isPrimary: [false],
      displayOrder: [1]
    });
  }

  private createVariantFormGroup(): FormGroup {
    return this.fb.group({
      size: ['', Validators.required],
      color: ['', Validators.required],
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      status: [true]
    });
  }

  // File Upload Methods
  onFileSelected(event: Event, index: number): void {
    this.handleFileUpload(event, (url) => {
      const imageForm = this.imagesForm.at(index);
      imageForm.get('imageUrl')?.setValue(url);
    });
  }

  onVariantFileSelected(event: Event, index: number): void {
    this.handleFileUpload(event, (url) => {
      const variantForm = this.variantsForm.at(index);
      variantForm.get('imageUrl')?.setValue(url);
    });
  }

  onFileSelected_imageproduct(event: Event): void {
    this.handleFileUpload(event, (url) => {
      this.productForm.patchValue({ thumbnail: url });
    });
  }

  private handleFileUpload(event: Event, callback: (url: string) => void): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.cloudinaryService.uploadProductImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          callback(response.imageUrl);
          this.toastr.success('Tải ảnh lên thành công');
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.toastr.error('Tải ảnh lên thất bại');
        }
      });
  }

  // Form Array Actions
  addImage(): void {
    this.imagesForm.push(this.createImageFormGroup());
  }

  removeImage(index: number): void {
    this.imagesForm.removeAt(index);
  }

  addVariant(): void {
    this.variantsForm.push(this.createVariantFormGroup());
  }

  removeVariant(index: number): void {
    this.variantsForm.removeAt(index);
  }

  // Form Submission
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastr.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.isSubmitting = true;
    const { images, variants, ...productData } = this.productForm.value;

    this.productService.createProduct(productData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdProduct: Product) => {
          const productId = createdProduct.productId;
          
          // Create images and variants in parallel
          forkJoin([
            ...images.map((img: ProductImage) => 
              this.productImageService.createProductImage({ ...img, productId })),
            ...variants.map((variant: ProductVariant) => 
              this.productVariantService.createProductVariant({ ...variant, productId }))
          ])
          .subscribe({
            next: () => {
              this.toastr.success('Thêm sản phẩm thành công');
              this.router.navigate(['/admin/add-product']);
            },
            error: (error) => {
              console.error('Error creating product details:', error);
              this.toastr.error('Có lỗi xảy ra khi tạo chi tiết sản phẩm');
            }
          });
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.toastr.error('Có lỗi xảy ra khi tạo sản phẩm');
          this.isSubmitting = false;
        }
      });
  }

  // Helper Methods
  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
}