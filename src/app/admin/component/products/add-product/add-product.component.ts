import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent {
  productForm: FormGroup;
  imagePreviews: string[] = [];
  variants: any[] = [];

  // ✅ Danh sách kích thước (Size)
  sizes: string[] = ["S", "M", "L", "XL", "XXL"];

  // ✅ Danh sách màu sắc
  colors: string[] = ["Đỏ", "Xanh", "Vàng", "Trắng", "Đen"];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: [''],
      description: [''],
      price: [0],
      sale_price: [0],
      category_id: [''],
      brand_id: [''],
      status: [1],
    });
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
  }

  addVariant() {
    const newVariant = { 
      color: this.colors[0], 
      size: this.sizes[0], 
      sku: '', 
      price: 0, 
      stock_quantity: 0 
    };
    newVariant.sku = this.generateSKU(newVariant.color, newVariant.size);
    this.variants.push(newVariant);
  }

  removeVariant(index: number) {
    this.variants.splice(index, 1);
  }

  updateSKU(index: number) {
    const variant = this.variants[index];
    variant.sku = this.generateSKU(variant.color, variant.size);
  }

  generateSKU(color: string, size: string): string {
    const productName = this.productForm.get('name')?.value || "PROD";
    const colorCode = color.substring(0, 3).toUpperCase(); // Lấy 3 ký tự đầu của màu
    const sizeCode = size.toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000); // Số ngẫu nhiên 4 chữ số
    return `${productName}-${colorCode}-${sizeCode}-${randomCode}`;
  }

  onSubmit() {
    console.log(this.productForm.value);
    console.log("Images:", this.imagePreviews);
    console.log("Variants:", this.variants);
  }
}
