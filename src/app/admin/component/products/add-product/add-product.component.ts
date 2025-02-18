import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

// Import 3 service tách biệt
import { ProductService } from 'src/app/service/product.service';
import { BrandService } from 'src/app/service/brand.service';
import { CategoryService } from 'src/app/service/category.service';
import { ProductImageService } from 'src/app/service/product-image.service';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { CloudinaryService } from 'src/app/service/cloudinary.service'; // <-- import

// Import các interface
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
export class AddProductComponent implements OnInit {
  productForm!: FormGroup;       // Form cho Product
  imagesForm!: FormArray;        // FormArray quản lý list hình ảnh
  variantsForm!: FormArray;      // FormArray quản lý list biến thể
  categories: Category[] = [];
  brands: Brand[] = [];

  availableColors = ['Red', 'Blue', 'Green'];
  availableSizes = ['S', 'M', 'L', 'XL'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cloudinaryService: CloudinaryService,
    private brandService: BrandService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.buildProductForm();
    this.loadCategories();
    this.loadBrands();
  }

  // Khởi tạo Form
  buildProductForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      salePrice: [0],
      thumbnail: [''],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      status: [true],

      images: this.fb.array([]),    // Mảng các hình ảnh
      variants: this.fb.array([])   // Mảng các biến thể
    });

    this.imagesForm = this.productForm.get('images') as FormArray;
    this.variantsForm = this.productForm.get('variants') as FormArray;
  }
  // ========== CATEGORY ==========
  // Load categories from API
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Lỗi khi load categories:', err);
      }
    });
  }

  // Load brands from API
  loadBrands() {
    this.brandService.getAllBrands().subscribe({
      next: (bds: Brand[]) => {
        this.brands = bds;
      },
      error: (err) => {
        console.error('Lỗi khi load brands:', err);
      }
    });
  }

  // ========== IMAGE ==========
  createImageFormGroup(): FormGroup {
    return this.fb.group({
      imageUrl: ['', Validators.required],
      isPrimary: [false],
      displayOrder: [1]
    });
  }

  addImage() {
    this.imagesForm.push(this.createImageFormGroup());
  }

  removeImage(index: number) {
    this.imagesForm.removeAt(index);
  }

  // ========== VARIANT ==========
  createVariantFormGroup(): FormGroup {
    return this.fb.group({
      size: [''],
      color: [''],
      sku: [''],
      price: [0],
      stockQuantity: [0],
      imageUrl: [''],
      status: [true]
    });
  }

  addVariant() {
    this.variantsForm.push(this.createVariantFormGroup());
  }

  removeVariant(index: number) {
    this.variantsForm.removeAt(index);
  }
  // ========== UPLOAD IMAGE TO CLOUDINARY ==========
  onFileSelected(event: Event, index: number) {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];

    // Gửi file lên Cloudinary
    this.cloudinaryService.uploadProductImage(file).subscribe({
      next: (res) => {
        console.log('Upload kết quả:', res);
        // Giả sử server trả về: { success: true, imageUrl: 'https://cloudinary.com/...' }
        const imageUrl = res.imageUrl;
        // Gán URL vào formControl
        const imageForm = this.imagesForm.at(index);
        imageForm.get('imageUrl')?.setValue(imageUrl);
      },
      error: (err) => {
        console.error('Lỗi upload ảnh:', err);
        // Tùy trường hợp bạn có thể reset input, hiển thị thông báo...
      }
    });
  }

  // ----------  UPLOAD ảnh biến thể ----------
  onVariantFileSelected(event: Event, index: number) {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }
  
    const file = fileInput.files[0];
  
    // Upload lên Cloudinary
    this.cloudinaryService.uploadProductImage(file).subscribe({
      next: (res) => {
        console.log('Upload kết quả (variant):', res);
        const imageUrl = res.imageUrl;
  
        // Gán URL vào variantsForm thay vì imagesForm
        const variantForm = this.variantsForm.at(index);
        variantForm.get('imageUrl')?.setValue(imageUrl);
      },
      error: (err) => {
        console.error('Lỗi upload ảnh biến thể:', err);
      }
    });
  }
  
  // Xử lý khi người dùng chọn file
  onFileSelected_imageproduct(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return; // không có file
    }

    const file = input.files[0];

    // Gọi service upload lên Cloudinary
    this.cloudinaryService.uploadProductImage(file).subscribe({
      next: (res) => {
        // Giả sử server trả về res.imageUrl
        const url = res.imageUrl; 
        // Gán URL vào formControl
        this.productForm.patchValue({ thumbnail: url });
      },
      error: (err) => {
        console.error('Lỗi upload ảnh:', err);
        alert('Upload ảnh thất bại!');
      }
    });
  }


  // ========== SUBMIT FORM ==========
  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Tách dữ liệu product, images, variants
    const { images, variants, ...productData } = this.productForm.value;

    // 1. Gọi API tạo sản phẩm
    this.productService.createProduct(productData).subscribe({
      next: (createdProduct: Product) => {
        const productId = createdProduct.productId;

        // 2. Tạo images
        if (images && images.length > 0) {
          images.forEach((img: any) => {
            const newImage: ProductImage = {
              productId: productId!,
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder
            };
            this.productImageService.createProductImage(newImage).subscribe();
          });
        }

        // 3. Tạo variants
        if (variants && variants.length > 0) {
          variants.forEach((v: any) => {
            const newVariant: ProductVariant = {
              productId: productId!,
              size: v.size,
              color: v.color,
              sku: v.sku,
              price: v.price,
              stockQuantity: v.stockQuantity,
              imageUrl: v.imageUrl,
              status: v.status
            };
            this.productVariantService.createProductVariant(newVariant).subscribe();
          });
        }

        // Sau khi tạo xong, bạn có thể điều hướng hoặc reset form
        alert('Thêm sản phẩm thành công!');
        this.productForm.reset();
      },
      error: (err) => {
        console.error('Lỗi khi tạo sản phẩm:', err);
        alert('Đã xảy ra lỗi khi thêm sản phẩm.');
      },
    });
  }
}
