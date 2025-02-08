import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="container">
      <i class="fas fa-exclamation-triangle icon"></i>
      <h1>404</h1>
      <p>Oops! Trang bạn đang tìm không tồn tại.</p>
      <a routerLink="/" class="btn">
        <i class="fas fa-home"></i> Quay lại trang chủ
      </a>
    </div>
  `,
  styleUrls: ['page-not-found.component.scss']
})
export class PageNotFoundComponent {}
