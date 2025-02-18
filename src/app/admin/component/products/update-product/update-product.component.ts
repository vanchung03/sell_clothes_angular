import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.scss']
})
export class UpdateProductComponent implements OnInit {
  productForm!: FormGroup;
  imagesForm!: FormArray;
  variantsForm!: FormArray;
  productId!: number;

  categories: Category[] = [];
  brands: Brand[] = [];

  availableColors = ['Red', 'Blue', 'Green'];
  availableSizes = ['S', 'M', 'L', 'XL'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private productService: ProductService,
    private productImageService: ProductImageService,
    private productVariantService: ProductVariantService,
    private cloudinaryService: CloudinaryService ,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    // Lấy productId từ URL
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.buildUpdateForm();
    this.loadCategories();
    this.loadBrands();

    // 1. Lấy thông tin product
    this.productService.getProductById(this.productId).subscribe((product) => {
      this.patchProductToForm(product);
    });

    // 2. Lấy danh sách images
    this.productImageService.getAllProductImages(this.productId).subscribe((images) => {
      this.patchImagesToForm(images);
    });

    // 3. Lấy danh sách variants
    this.productVariantService
      .getAllVariantsByProductId(this.productId)
      .subscribe((variants) => {
        this.patchVariantsToForm(variants);
      });
  }
  
  buildUpdateForm() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, Validators.required],
      salePrice: [0],
      thumbnail:  ['', Validators.required],
      categoryId: [null, Validators.required],
      brandId: [null, Validators.required],
      status: [true],

      images: this.fb.array([]),
      variants: this.fb.array([])
    });

    this.imagesForm = this.productForm.get('images') as FormArray;
    this.variantsForm = this.productForm.get('variants') as FormArray;
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

  // Tạo mới form group cho 1 ảnh
  createImageFormGroup(): FormGroup {
    return this.fb.group({
      imageId: [null],
      imageUrl: ['', Validators.required],
      isPrimary: [false],
      displayOrder: [1]
    });
  }

  // Thêm image mới vào form
  addImage() {
    this.imagesForm.push(this.createImageFormGroup());
  }

  // Xóa image (nếu đã có ID => xóa ở server)
  removeImage(index: number) {
    const image = this.imagesForm.at(index).value as ProductImage;
    if (image.imageId) {
      // Gọi API xóa nếu muốn xóa luôn ở server
      this.productImageService.deleteProductImage(image.imageId).subscribe(() => {
        this.imagesForm.removeAt(index);
      });
    } else {
      // Nếu chưa có ID, chỉ cần remove khỏi form
      this.imagesForm.removeAt(index);
    }
  }

  // Tạo mới form group cho 1 variant
  createVariantFormGroup(): FormGroup {
    return this.fb.group({
      variantId: [null],
      size: [''],
      color: [''],
      sku: [''],
      price: [0],
      stockQuantity: [0],
      imageUrl: [''],
      status: [true]
    });
  }

  // Thêm variant
  addVariant() {
    this.variantsForm.push(this.createVariantFormGroup());
  }

  // Xóa variant (nếu đã có ID => xóa ở server)
  removeVariant(index: number) {
    const variant = this.variantsForm.at(index).value as ProductVariant;
    if (variant.variantId) {
      this.productVariantService.deleteProductVariant(variant.variantId).subscribe(() => {
        this.variantsForm.removeAt(index);
      });
    } else {
      this.variantsForm.removeAt(index);
    }
  }

  // Khi nhấn submit => cập nhật
  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    // Tách dữ liệu
    const { images, variants, ...updatedProductData } = this.productForm.value;

    // 1. Cập nhật product
    this.productService.updateProduct(this.productId, updatedProductData).subscribe({
      next: () => {
        // 2. Xử lý images
        images.forEach((img: ProductImage) => {
          // Nếu đã có imageId => update, chưa có => create
          if (img.imageId) {
            // Gọi update
            this.productImageService.updateProductImage(img.imageId, img).subscribe();
          } else {
            // Gọi create
            const newImage: ProductImage = {
              productId: this.productId,
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary,
              displayOrder: img.displayOrder
            };
            this.productImageService.createProductImage(newImage).subscribe();
          }
        });

        // 3. Xử lý variants
        variants.forEach((v: ProductVariant) => {
          // Nếu đã có variantId => update, chưa có => create
          if (v.variantId) {
            this.productVariantService.updateProductVariant(v.variantId, v).subscribe();
          } else {
            const newVariant: ProductVariant = {
              productId: this.productId,
              size: v.size,
              color: v.color,
              sku: v.sku,
              price: v.price,
              stockQuantity: v.stockQuantity,
              imageUrl: v.imageUrl,
              status: v.status
            };
            this.productVariantService.createProductVariant(newVariant).subscribe();
          }
        });

        alert('Cập nhật sản phẩm thành công!');
        // Điều hướng về trang danh sách hoặc ở lại trang
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        alert('Đã xảy ra lỗi khi cập nhật sản phẩm.');
      },
    });
  }
  // Upload ảnh lên Cloudinary
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
}
