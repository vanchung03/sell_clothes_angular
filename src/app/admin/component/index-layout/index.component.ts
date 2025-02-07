import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
@Component({
  selector: 'app-admin-layout',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  [x: string]: any;
  sidebarOpen = true;
  isDarkMode = false;
  constructor(private router: Router) {} // Inject Router
  ngOnInit() {
    // Kiểm tra chế độ sáng/tối khi tải lại trang
    const savedMode = localStorage.getItem('dark-mode');
    if (savedMode === 'enabled') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode'); // Thêm lớp dark-mode vào body
    } else {
      this.isDarkMode = false;
      document.body.classList.remove('dark-mode'); // Thêm lớp dark-mode vào body nếu không có
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode'); // Thêm lớp dark-mode vào body
      localStorage.setItem('dark-mode', 'enabled'); // Lưu trạng thái vào localStorage
    } else {
      document.body.classList.remove('dark-mode'); // Xóa lớp dark-mode khỏi body
      localStorage.setItem('dark-mode', 'disabled'); // Lưu trạng thái vào localStorage
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }
  
}
