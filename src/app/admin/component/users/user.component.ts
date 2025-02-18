import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../service/user.service';
import { User } from 'src/app/types/User';
import { UpdateUserComponent } from './update-user/update-user.component';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-user-management',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['select', 'idEmailAvatar', 'username', 'fullName', 'phone', 'roles', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>();
  isLoading: boolean = true;
  selectedUsers: User[] = []; // Danh sách user được chọn

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private userService: UserService, private toastr: ToastrService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.dataSource.data = data;
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
      newStatus = 0;
    } else if (user.status === 0) {
      newStatus = 2;
    } else {
      newStatus = 1;
    }

    this.userService.updateUser(user.userId, { status: newStatus }).subscribe(
      () => {
        this.toastr.success('Trạng thái đã được cập nhật!', 'Thành công');
        user.status = newStatus;
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
  exportToExcel(): void {
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      this.toastr.warning('Không có dữ liệu để xuất!', 'Cảnh báo');
      return;
    }
  
    const dataToExport = this.dataSource.data.map(user => ({
      'ID': user.userId,
      'Email': user.email,
      'Tên đăng nhập': user.username,
      'Họ và tên': user.fullName,
      'Số điện thoại': user.phone,
      'Quyền': Array.isArray(user.roles) ? user.roles.map(role => role.name).join(', ') : user.roles,
      'Trạng thái': this.getStatusText(user.status)
    }));
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  
    // 🆕 Định dạng tiêu đề
    const headerCellStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 }, // Chữ trắng, đậm, size 14
      fill: { fgColor: { rgb: "007bff" } }, // Màu nền xanh
      alignment: { horizontal: "center", vertical: "center" }
    };
  
    // 🆕 Định dạng các ô nội dung
    const contentCellStyle = {
      alignment: { horizontal: "left", vertical: "center" },
      font: { sz: 12 }
    };
  
    // Áp dụng định dạng cho từng ô trong Sheet
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = headerCellStyle; // Header style
    }
  
    // 🆕 Tự động điều chỉnh độ rộng cột
    ws['!cols'] = [
      { wch: 5 },  // ID
      { wch: 25 }, // Email
      { wch: 20 }, // Tên đăng nhập
      { wch: 25 }, // Họ và tên
      { wch: 15 }, // Số điện thoại
      { wch: 20 }, // Quyền
      { wch: 15 }  // Trạng thái
    ];
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng');
  
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    saveAs(data, `Danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.xlsx`);
  
    this.toastr.success('Xuất file Excel thành công!', 'Thành công');
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
      if (result === true) {
        this.loadUsers();
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          this.toastr.success('Xóa người dùng thành công!', 'Thành công');
        },
        error: (err) => {
          console.error('Lỗi khi xóa người dùng:', err);
          this.toastr.error('Không thể xóa người dùng!', 'Lỗi');
        }
      });
    }
  }

  /** 🆕 Chọn một user */
  toggleSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.userId === user.userId);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  /** 🆕 Kiểm tra user có được chọn không */
  isSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.userId === user.userId);
  }

  /** 🆕 Chọn tất cả */
  toggleAllSelection(event: any): void {
    if (event.checked) {
      this.selectedUsers = [...this.dataSource.data];
    } else {
      this.selectedUsers = [];
    }
  }

  /** 🆕 Kiểm tra tất cả có được chọn không */
  isAllSelected(): boolean {
    return this.selectedUsers.length === this.dataSource.data.length;
  }

  /** 🆕 Xóa nhiều người dùng */
  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      this.toastr.warning('Chưa chọn người dùng nào!', 'Cảnh báo');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa ${this.selectedUsers.length} người dùng không?`)) {
      return;
    }

    const idsToDelete = this.selectedUsers.map(user => user.userId);

    idsToDelete.forEach(userId => {
      this.userService.deleteUser(userId).subscribe(
        () => {
          this.toastr.success(`Đã xóa người dùng ID: ${userId}`, 'Thành công');
          this.loadUsers();
        },
        (error) => {
          console.error('Lỗi khi xóa người dùng:', error);
          this.toastr.error(`Không thể xóa người dùng ID: ${userId}`, 'Lỗi');
        }
      );
    });

    this.selectedUsers = [];
  }

  /** 🆕 Khôi phục người dùng đã xóa */
  restoreUser(userId: number): void {
    if (confirm('Bạn có chắc chắn muốn khôi phục người dùng này?')) {
      // this.userService.restoreUser(userId).subscribe(
      //   () => {
      //     this.toastr.success('Khôi phục người dùng thành công!', 'Thành công');
      //     this.loadUsers();
      //   },
      //   (error) => {
      //     console.error('Lỗi khi khôi phục người dùng:', error);
      //     this.toastr.error('Không thể khôi phục người dùng!', 'Lỗi');
      //   }
      // );
    }
  }
}
