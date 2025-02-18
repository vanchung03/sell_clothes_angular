import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../service/user.service';
import { User } from 'src/app/types/User';
import { UpdateUserComponent } from './update-user/update-user.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-user-management',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['idEmailAvatar', 'username', 'fullName', 'phone', 'roles', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>();
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private toastr: ToastrService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator; 
  }


  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator; 
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        this.toastr.error('Không thể tải dữ liệu người dùng!', 'Lỗi');
        this.isLoading = false;
      }
    );
  }
  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Active';
      case 0: return 'Inactive';
      case 2: return 'Banned';
      default: return 'Unknown';
    }
  }
  getStatusIcon(status: number): string {
    switch (status) {
      case 1: return 'toggle_on';  
      case 0: return 'toggle_off';
      case 2: return 'block';     
      default: return 'help_outline'; 
    }
  }
  toggleStatus(user: User): void {
    if (!user || user.userId === undefined) {
      this.toastr.error('Lỗi: Không tìm thấy ID người dùng!', 'Lỗi');
      return;
    }
  
    let newStatus: number;
    if (user.status === 1) {
      newStatus = 0; // Chuyển từ Active -> Inactive
    } else if (user.status === 0) {
      newStatus = 2; // Chuyển từ Inactive -> Banned
    } else {
      newStatus = 1; // Chuyển từ Banned -> Active
    }
  
    this.userService.updateUser(user.userId, { status: newStatus }).subscribe(
      () => {
        this.toastr.success('Trạng thái đã được cập nhật!', 'Thành công');
        user.status = newStatus; // Cập nhật trạng thái trên UI ngay lập tức
      },
      (error) => {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        this.toastr.error('Lỗi khi cập nhật trạng thái!', 'Lỗi');
      }
    );
  }
  
     

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  clearSearch(inputElement: HTMLInputElement) {
    inputElement.value = ''; 
    this.applyFilter({ target: inputElement } as unknown as Event);
  }

  exportToExcel() {
    console.log('Xuất file Excel!');
  }
  openEditDialog(userId: number): void {
    if (!userId) {
      this.toastr.error('Lỗi: Không tìm thấy ID người dùng!', 'Lỗi');
      return;
    }
  
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      data: { userId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal đóng với result:', result);
  
      if (result === true) { 
        this.loadUsers();
      } else {
        console.log('Không có thay đổi, không hiển thị thông báo.');
      }
    });
  }
  
  

  deleteUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
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
  }
}
