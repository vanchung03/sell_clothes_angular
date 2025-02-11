import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class AdminLayoutComponent {
  isDarkMode = false; // Trạng thái chế độ sáng/tối
  showMenu = false;
  constructor(private router: Router, private renderer: Renderer2) {}

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const body = document.body;
    if (this.isDarkMode) {
      this.renderer.addClass(body, 'dark-theme');
      this.renderer.removeClass(body, 'light-theme');
    } else {
      this.renderer.addClass(body, 'light-theme');
      this.renderer.removeClass(body, 'dark-theme');
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }
}
