import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  
  constructor(private router: Router) {}
 
  // Đăng xuất người dùng và xóa token
  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigateByUrl('/login');
  }

}
