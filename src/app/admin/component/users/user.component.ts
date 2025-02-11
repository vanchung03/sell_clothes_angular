import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UserService } from '../../../service/user.service';
import { User } from 'src/app/types/users/UserResponse';

@Component({
  selector: 'app-user-management',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['idEmailAvatar', 'username', 'fullName', 'phone', 'roles', 'status', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource<User>([]);
  isLoading: boolean = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Liên kết paginator với MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);

        // Đảm bảo paginator được liên kết sau khi dữ liệu được tải
        this.dataSource.paginator = this.paginator;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách người dùng:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  editUser(user: User): void {
    console.log('Sửa người dùng:', user);
  }

  deleteUser(userId: number): void {
    console.log('Xóa người dùng với ID:', userId);
  }
}
