import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/service/category.service';
import { Category } from 'src/app/types/category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  searchTerm: string = '';
  selectedCategory: Category = {
    name: '',
    description: '',
    slug: '',
    status: true
  };
  isEditing: boolean = false;
  isFormVisible: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      (categories: Category[]) => {
        this.categories = categories;
      },
      (error) => {
        this.toastr.error('Không thể tải danh mục.');
      }
    );
  }

  createCategory(): void {
    if (this.selectedCategory && this.selectedCategory.name) {
      this.categoryService.createCategory(this.selectedCategory).subscribe(
        (newCategory: Category) => {
          this.toastr.success('Tạo danh mục thành công!');
          this.categories.push(newCategory);
          this.resetForm();
        },
        (error) => {
          this.toastr.error('Không thể tạo danh mục.');
        }
      );
    }
  }

  updateCategory(): void {
    if (this.selectedCategory && this.selectedCategory.name) {
      this.categoryService.updateCategory(this.selectedCategory.categoryId!, this.selectedCategory).subscribe(
        (updatedCategory: Category) => {
          this.toastr.success('Cập nhật danh mục thành công!');
          const index = this.categories.findIndex(category => category.categoryId === updatedCategory.categoryId);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
          }
          this.resetForm();
        },
        (error) => {
          this.toastr.error('Không thể cập nhật danh mục.');
        }
      );
    }
  }

  confirmDelete(category: Category): void {
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      this.deleteCategory(category.categoryId!);
    }
  }

  deleteCategory(id: number): void {
    this.categoryService.deleteCategory(id).subscribe(
      () => {
        this.toastr.success('Xóa danh mục thành công!');
        this.categories = this.categories.filter(category => category.categoryId !== id);
      },
      (error) => {
        this.toastr.error('Không thể xóa danh mục.');
      }
    );
  }

  searchCategories(): void {
    if (this.searchTerm) {
      this.categoryService.searchCategories(this.searchTerm).subscribe(
        (categories: Category[]) => {
          this.categories = categories;
        },
        (error) => {
          this.toastr.error('Lỗi tìm kiếm danh mục.');
        }
      );
    } else {
      this.getAllCategories(); // Reset if search term is empty
    }
  }

  selectCategory(category: Category): void {
    this.selectedCategory = { ...category };
    this.isEditing = true;
    this.isFormVisible = true;
  }

  showCreateForm(): void {
    this.selectedCategory = { name: '', description: '', slug: '', status: true };
    this.isEditing = false;
    this.isFormVisible = true;
  }

  cancelForm(): void {
    this.isFormVisible = false;
  }

  resetForm(): void {
    this.selectedCategory = { name: '', description: '', slug: '', status: true };
    this.isEditing = false;
    this.isFormVisible = false;
    this.searchTerm = '';
    this.getAllCategories(); // Refresh the list after create/update
  }
}