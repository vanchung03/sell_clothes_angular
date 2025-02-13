import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../service/user.service';
import { User } from 'src/app/types/User';

@Component({
  selector: 'app-user-management',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['idEmailAvatar', 'username', 'fullName', 'phone', 'roles', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>();
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadUsers();
  }
  toggleStatus(user: any) {
    user.status = user.status === 1 ? 0 : 1;
  }
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.dataSource.data = data;
        this.toastr.success('Dữ liệu đã được tải thành công!', 'Thành công');
      },
      (error) => {
        console.error('Lỗi khi tải danh sách người dùng:',error);
        this.toastr.error('Không thể tải dữ liệu người dùng!', 'Lỗi');
        this.isLoading = false;
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  clearSearch(inputElement: HTMLInputElement) {
    inputElement.value = ''; // Xóa nội dung trong ô nhập
    this.applyFilter({ target: inputElement } as unknown as Event); // Áp dụng bộ lọc với giá trị trống
  }

  exportToExcel() {
    // Logic xuất file Excel, có thể sử dụng thư viện như xlsx
    console.log('Xuất file Excel!');
  }

  addUser() {
    // Điều hướng hoặc mở dialog thêm sản phẩm
    console.log('Thêm sản phẩm!');
  }


  editUser(user: User): void {
    this.toastr.info(`Sửa người dùng: ${user.username}`, 'Thông báo');
  }

  deleteUser(userId: number): void {
    let isCancelled = false;
  
    // Hiển thị thông báo với tùy chọn hủy
    const toastRef = this.toastr.warning('Người dùng sẽ bị xóa sau 3 giây. Nhấn để hủy!', 'Xác nhận xóa', {
      disableTimeOut: true,
      closeButton: true,
      tapToDismiss: false,
      onActivateTick: true
    });
  
    // Nếu người dùng nhấn vào thông báo, hủy xóa
    toastRef.onTap.subscribe(() => {
      isCancelled = true;
      this.toastr.info('Đã hủy xóa người dùng!', 'Hủy');
    });
  
    // Sau 3 giây, nếu không hủy thì tiến hành xóa
    setTimeout(() => {
      if (!isCancelled) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.loadUsers(); // Tải lại danh sách sau khi xóa
            this.toastr.success('Xóa người dùng thành công!', 'Thành công');
          },
          error: (err) => {
            console.error('Lỗi khi xóa người dùng:', err);
            this.toastr.error('Không thể xóa người dùng!', 'Lỗi');
          }
        });
      }
    }, 3000);
  }
  
}
