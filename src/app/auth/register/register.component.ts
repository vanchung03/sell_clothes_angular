import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: '../register/register.component.html',
  styleUrls: ['../register/register.component.scss']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';    // Khai báo thuộc tính email
  password: string = ''; // Khai báo thuộc tính password
  fullName: string = '';
  phone:string='';

  constructor() {}

  onRegister() {
    // Xử lý logic đăng ký ở đây
    console.log('Username:',this.username);
    console.log('Password:', this.password);
    console.log('Full Name:', this.fullName);
    console.log('Email:', this.email);
    console.log('Phone:',this.phone)
  }
}
