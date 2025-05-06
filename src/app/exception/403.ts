import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <p>Xin lỗi, trang bạn đang tìm không tồn tại.</p>
        <a routerLink="/home" class="btn-back">
          <i class="fas fa-home"></i> Quay lại trang chủ
        </a>
      </div>
    </div>
  `,
  styleUrls: ['403.scss']
})
export class PageNotFoundComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Chuyển hướng về trang chủ sau 3 giây
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1000); // Thời gian trễ 3 giây
  }
}
