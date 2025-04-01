import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']
})
export class UpdateProductComponent implements OnInit, OnDestroy {
  // Form Controls
  productForm!: FormGroup;
  imagesForm!: FormArray;
  variantsForm!: FormArray;

  // Component State
  productId!: number;
  isLoading = false;
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  // Data Collections
  categories: Category[] = [];
  brands: Brand[] = [];

  // Constants
  readonly availableColors = [
    'Đỏ', 'Xanh', 'Be', 'Nâu', 'Vàng', 
    'Đen', 'Trắng', 'Cam', 'Hồng', 'Xám'
  ];
  
  readonly availableSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cloudinaryService: CloudinaryService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    initAOS();
    this.initializeForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.min(0)]],
      thumbnail: ['', Validators.required],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      status: [true],
      images: this.fb.array([]),
      variants: this.fb.array([])
    });

    this.imagesForm = this.productForm.get('images') as FormArray;
    this.variantsForm = this.productForm.get('variants') as FormArray;
  }

  private loadData(): void {
    this.isLoading = true;
    this.productId = +this.route.snapshot.paramMap.get('id')!;

    forkJoin({
      product: this.productService.getProductById(this.productId),
      images: this.productImageService.getAllProductImages(this.productId),
      variants: this.productVariantService.getAllVariantsByProductId(this.productId),
      categories: this.categoryService.getAllCategories(),
      brands: this.brandService.getAllBrands()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.brands = data.brands;
        this.patchProductToForm(data.product);
        this.patchImagesToForm(data.images);
        this.patchVariantsToForm(data.variants);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.toastr.error('Không thể tải dữ liệu sản phẩm');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.toastr.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.isSubmitting = true;
    const { images, variants, ...productData } = this.productForm.value;

    forkJoin({
      product: this.productService.updateProduct(this.productId, productData),
      images: forkJoin(this.processImages(images)),
      variants: forkJoin(this.processVariants(variants))
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toastr.success('Cập nhật sản phẩm thành công');
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.toastr.error('Có lỗi xảy ra khi cập nhật sản phẩm');
        this.isSubmitting = false;
      }
    });
  }

  private processImages(images: ProductImage[]) {
    return images.map(img => {
      if (img.imageId) {
        return this.productImageService.updateProductImage(img.imageId, img);
      }
      return this.productImageService.createProductImage({
        ...img,
        productId: this.productId
      });
    });
  }

  private processVariants(variants: ProductVariant[]) {
    return variants.map(variant => {
      if (variant.variantId) {
        return this.productVariantService.updateProductVariant(variant.variantId, variant);
      }
      return this.productVariantService.createProductVariant({
        ...variant,
        productId: this.productId
      });
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

  // Form Array Methods
  addImage(): void {
    this.imagesForm.push(this.createImageFormGroup());
  }

  removeImage(index: number): void {
    const image = this.imagesForm.at(index).value as ProductImage;
    if (image.imageId) {
      this.productImageService.deleteProductImage(image.imageId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.imagesForm.removeAt(index);
            this.toastr.success('Xóa ảnh thành công');
          },
          error: (error) => {
            console.error('Error deleting image:', error);
            this.toastr.error('Không thể xóa ảnh');
          }
        });
    } else {
      this.imagesForm.removeAt(index);
    }
  }

  addVariant(): void {
    this.variantsForm.push(this.createVariantFormGroup());
  }

  removeVariant(index: number): void {
    const variant = this.variantsForm.at(index).value as ProductVariant;
    if (variant.variantId) {
      this.productVariantService.deleteProductVariant(variant.variantId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.variantsForm.removeAt(index);
            this.toastr.success('Xóa biến thể thành công');
          },
          error: (error) => {
            console.error('Error deleting variant:', error);
            this.toastr.error('Không thể xóa biến thể');
          }
        });
    } else {
      this.variantsForm.removeAt(index);
    }
  }

  // Form Group Creation Methods
  private createImageFormGroup(): FormGroup {
    return this.fb.group({
      imageId: [null],
      imageUrl: ['', Validators.required],
      isPrimary: [false],
      displayOrder: [1]
    });
  }

  private createVariantFormGroup(): FormGroup {
    return this.fb.group({
      variantId: [null],
      size: ['', Validators.required],
      color: ['', Validators.required],
      sku: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      status: [true]
    });
  }


  // Áp data product vào form
  patchProductToForm(product: Product) {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice,
      thumbnail: product.thumbnail,
      categoryId: product.categoryId,
      brandId: product.brandId,
      status: product.status
    });
  }

  // Áp data images vào form
  patchImagesToForm(images: ProductImage[]) {
    images.forEach((img) => {
      this.imagesForm.push(
        this.fb.group({
          imageId: [img.imageId || null],
          productId: [img.productId || null], // có thể lưu tạm, hoặc bỏ nếu ko cần
          imageUrl: [img.imageUrl, Validators.required],
          isPrimary: [img.isPrimary],
          displayOrder: [img.displayOrder]
        })
      );
    });
  }


  // Áp data variants vào form
  patchVariantsToForm(variants: ProductVariant[]) {
    variants.forEach((v) => {
      this.variantsForm.push(
        this.fb.group({
          variantId: [v.variantId || null],
          productId: [v.productId || null], // có thể lưu tạm, hoặc bỏ nếu ko cần
          size: [v.size],
          color: [v.color],
          sku: [v.sku],
          price: [v.price],
          stockQuantity: [v.stockQuantity],
          imageUrl: [v.imageUrl],
          status: [v.status]
        })
      );
    });
  }

}