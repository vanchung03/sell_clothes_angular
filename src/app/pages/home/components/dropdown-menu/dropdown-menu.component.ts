import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/service/category.service';
import { Category } from 'src/app/types/category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss']
})
export class DropdownMenuComponent implements OnInit {
  categoriesMale: Category[] = [];
  categoriesFemale: Category[] = [];

  constructor(private categoryService: CategoryService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.searchCategories('nam').subscribe(data => {
      this.categoriesMale = data;
    });

    this.categoryService.searchCategories('nữ').subscribe(data => {
      this.categoriesFemale = data;
    });
  }

  // Khi nhấn vào danh mục, điều hướng đến SaleProductsComponent với categoryId
  navigateToCategory(category: Category): void {
    this.router.navigate(['/products-category'], { queryParams: { categoryId: category.categoryId } });
  }
}
