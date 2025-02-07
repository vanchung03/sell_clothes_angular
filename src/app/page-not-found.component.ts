import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
    <div class="container">
      <h1>404</h1>
      <p>Oops! Trang bạn đang tìm không tồn tại.</p>
      <a routerLink="/" class="btn">Quay lại trang chủ</a>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      background-color: #f8f9fa;
    }
    
    h1 {
      font-size: 6rem;
      color: #dc3545;
      margin: 0;
    }

    p {
      font-size: 1.5rem;
      color: #6c757d;
      margin: 10px 0;
    }

    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1.2rem;
      color: #fff;
      background-color: #007bff;
      border-radius: 5px;
      text-decoration: none;
      transition: 0.3s;
    }

    .btn:hover {
      background-color: #0056b3;
    }
  `]
})
export class PageNotFoundComponent {}
