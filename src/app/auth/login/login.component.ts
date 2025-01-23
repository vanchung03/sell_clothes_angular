import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: '../login/login.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class LoginComponent {
  username: string = '';    // Khai báo thuộc tính email
  password: string = ''; // Khai báo thuộc tính password

  constructor() {}

  onLogin() {
    // Xử lý logic đăng nhập ở đây
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
