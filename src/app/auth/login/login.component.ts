import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: '../login/login.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class LoginComponent {
  email: string = '';    // Khai báo thuộc tính email
  password: string = ''; // Khai báo thuộc tính password

  constructor() {}

  onLogin() {
    // Xử lý logic đăng nhập ở đây
    console.log('Email:', this.email);
    console.log('Password:', this.password);
  }
}
