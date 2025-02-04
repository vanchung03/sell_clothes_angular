import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  cart: { name: string, price: number }[] = [];
  total: number = 0;
  constructor(private router: Router) {}

  addToCart(name: string, price: number) {
    this.cart.push({ name, price });
    this.total += price;
  }

  checkout() {
    alert('Thanh toán thành công!');
    this.cart = [];
    this.total = 0;
  }
  // Đăng xuất người dùng và xóa token
  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }

}
