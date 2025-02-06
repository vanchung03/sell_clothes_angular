import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../service/user.service';  // Import dịch vụ người dùng

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['userId', 'username', 'email', 'fullName', 'phone', 'avatar', 'status', 'roles', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]); 
  isLoading: boolean = true;
  searchTerm: string = '';

  constructor(private userService: UserService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Lấy danh sách người dùng từ API
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);  // Cập nhật lại dataSource với dữ liệu từ API
      this.isLoading = false;
    });
  }



  // Thêm người dùng mới
  addUser(): void {
    // Logic thêm người dùng mới
  }

  // Sửa người dùng
  editUser(user: any): void {
    // Logic sửa người dùng
  }
}
