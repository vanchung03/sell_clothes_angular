import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <p>Xin lỗi, trang bạn đang tìm không tồn tại.</p>
        <a routerLink="/" class="btn-back">
          <i class="fas fa-home"></i> Quay lại trang chủ
        </a>
      </div>
    </div>
  `,
  styleUrls: ['page-not-found.component.scss']
})
export class PageNotFoundComponent {}
