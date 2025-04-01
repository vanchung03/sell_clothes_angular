import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BrandService } from 'src/app/service/brand.service';
import { Brand } from 'src/app/types/brand';
import { CloudinaryService } from 'src/app/service/cloudinary.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { initAOS } from 'src/assets/aos-init';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
  providers: [DatePipe]
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  filteredBrands: Brand[] = [];
  searchTerm: string = '';
  selectedBrand: Brand = {
    name: '',
    logoUrl: '',
    description: '',
    status: true
  };
  isEditing: boolean = false;
  showForm: boolean = false;
  showDeleteConfirm: boolean = false;
  brandToDelete: Brand | null = null;
  
  // Filtering options
  statusFilter: string = 'all';
  sortOption: string = 'nameAsc';

  constructor(
    private brandService: BrandService,
    private cloudinaryService: CloudinaryService,
    private toastr: ToastrService,
    private cdRef: ChangeDetectorRef,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    initAOS();
    this.getAllBrands();
  }

  getAllBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (brands: Brand[]) => {
        this.brands = brands;
        this.applyFilters();
      },
      error: () => {
        this.toastr.error('Failed to fetch brands.');
      }
    });
  }

  // Phương thức này được gọi khi người dùng nhấn "New Brand"
  openCreateForm(): void {
    this.isEditing = false;
    this.selectedBrand = {
      name: '',
      logoUrl: '',
      description: '',
      status: true
    };
    this.showForm = true;
  }

  // Phương thức này được gọi khi người dùng submit form
  createBrand(): void {
    if (this.selectedBrand && this.selectedBrand.name) {
      this.brandService.createBrand(this.selectedBrand).subscribe({
        next: (newBrand: Brand) => {
          this.toastr.success('Brand created successfully!');
          this.brands.push(newBrand);
          this.closeForm();
          this.applyFilters();
        },
        error: () => {
          this.toastr.error('Failed to create brand.');
        }
      });
    }
  }

  removeLogo(): void {
    this.selectedBrand.logoUrl = ''; // Xóa URL logo
    this.toastr.info('Logo đã được gỡ bỏ.');
  }
  
  resetFilters(): void {
    this.statusFilter = 'all';
    this.sortOption = 'nameAsc';
    this.searchTerm = '';
    this.applyFilters();
  }
  
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedBrand = { name: '', logoUrl: '', description: '', status: true };
  }
  
  updateBrand(): void {
    if (this.selectedBrand.name && this.selectedBrand.brandId) {
      this.brandService.updateBrand(this.selectedBrand.brandId, this.selectedBrand).subscribe({
        next: (updatedBrand: Brand) => {
          this.toastr.success('Brand updated successfully!');
          const index = this.brands.findIndex(brand => brand.brandId === updatedBrand.brandId);
          if (index !== -1) {
            this.brands[index] = updatedBrand;
          }
          this.closeForm();
          this.applyFilters();
        },
        error: () => {
          this.toastr.error('Failed to update brand.');
        }
      });
    }
  }

  confirmDelete(brand: Brand): void {
    this.brandToDelete = brand;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.brandToDelete = null;
  }

  confirmDeleteAction(): void {
    if (this.brandToDelete?.brandId) {
      this.deleteBrand(this.brandToDelete.brandId);
    }
  }

  deleteBrand(id: number): void {
    this.brandService.deleteBrand(id).subscribe({
      next: () => {
        this.toastr.success('Brand deleted successfully!');
        this.brands = this.brands.filter(brand => brand.brandId !== id);
        this.showDeleteConfirm = false;
        this.brandToDelete = null;
        this.applyFilters();
      },
      error: () => {
        this.toastr.error('Failed to delete brand.');
      }
    });
  }

  searchBrands(): void {
    this.applyFilters();
  }

  selectBrand(brand: Brand): void {
    this.selectedBrand = { ...brand }; // Sao chép dữ liệu để tránh ảnh hưởng trực tiếp
    this.isEditing = true;
    this.showForm = true; // Hiển thị form chỉnh sửa
  }
  
  resetForm(): void {
    this.selectedBrand = { name: '', logoUrl: '', description: '', status: true };
    this.isEditing = false;
    this.getAllBrands();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
  
    const file = input.files[0];
  
    this.cloudinaryService.uploadLogoImage(file).subscribe({
      next: (response) => {
        const imageUrl = response.imageUrl || response.secure_url || response.url;
        if (!imageUrl) {
          this.toastr.error('Failed to get image URL.');
          return;
        }
  
        this.selectedBrand.logoUrl = imageUrl;
        this.toastr.success('Image uploaded successfully!');
        this.cdRef.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to upload image.');
      }
    });
  }

  applyFilters(): void {
    this.filteredBrands = this.brands.filter(brand => {
      return (
        (this.statusFilter === 'all' || 
         (this.statusFilter === 'active' && brand.status === true) || 
         (this.statusFilter === 'inactive' && brand.status === false)) &&
        (this.searchTerm === '' || brand.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    });

    this.sortBrands();
  }

  sortBrands(): void {
    if (this.sortOption === 'nameAsc') {
      this.filteredBrands.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortOption === 'nameDesc') {
      this.filteredBrands.sort((a, b) => b.name.localeCompare(a.name));
    }
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.brands);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands');
    XLSX.writeFile(workbook, 'Brands.xlsx');
  }

  exportToPDF(): void {
    const docDefinition = {
      content: [
        { text: 'Brand List', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              ['ID', 'Name', 'Status'],
              ...this.brands.map(brand => [
                brand.brandId, 
                brand.name, 
                brand.status ? 'Active' : 'Inactive'
              ])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
      }
    };
    // Implement PDF export functionality
  }
}