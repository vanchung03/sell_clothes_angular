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
import { initAOS } from 'src/app/aos-init';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    initAOS();
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
  
    //  Định dạng tiêu đề
    const headerCellStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 }, // Chữ trắng, đậm, size 14
      fill: { fgColor: { rgb: "007bff" } }, // Màu nền xanh
      alignment: { horizontal: "center", vertical: "center" }
    };
  
    //  Định dạng các ô nội dung
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
  
    //  Tự động điều chỉnh độ rộng cột
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

  /**  Chọn một user */
  toggleSelection(user: User): void {
    const index = this.selectedUsers.findIndex(u => u.userId === user.userId);
    if (index >= 0) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  /**  Kiểm tra user có được chọn không */
  isSelected(user: User): boolean {
    return this.selectedUsers.some(u => u.userId === user.userId);
  }

  /**  Chọn tất cả */
  toggleAllSelection(event: any): void {
    if (event.checked) {
      this.selectedUsers = [...this.dataSource.data];
    } else {
      this.selectedUsers = [];
    }
  }

  /**  Kiểm tra tất cả có được chọn không */
  isAllSelected(): boolean {
    return this.selectedUsers.length === this.dataSource.data.length;
  }

  /**  Xóa người dùng đã chọn */
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
  getUsersByStatus(status: number): User[] {
    return this.dataSource.data.filter(user => user.status === status);
  }

  getUserInitials(user: User): string {
    if (!user.fullName) return '?';
    return user.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  filterByRole(role: string): void {
    if (role === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (data: User, filter: string) => {
        return data.roles.some(r => r.name.toLowerCase() === filter.toLowerCase());
      };
      this.dataSource.filter = role;
    }
  }

  filterByStatus(status: string): void {
    if (status === 'all') {
      this.dataSource.filter = '';
    } else {
      this.dataSource.filterPredicate = (data: User, filter: string) => {
        return data.status.toString() === filter;
      };
      this.dataSource.filter = status;
    }
  }

  getRoleClass(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'admin': return 'ROLE_ADMIN';
      case 'user': return 'ROLE_USER';
      case 'moderator': return 'moderator-role';
      default: return '';
    }
  }

  isPartiallySelected(): boolean {
    return this.selectedUsers.length > 0 && this.selectedUsers.length < this.dataSource.data.length;
  }

  onRowClick(user: User, event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    this.toggleSelection(user);
  }
  viewUserDetails(user: User): void {
    // Implement user details view logic
    console.log('Viewing user details:', user);
  }

  showDeletedUsers(): void {
    // Implement show deleted users logic
    console.log('Showing deleted users');
  }

  // -------- Thêm hàm exportToPDF() --------
 // =============================================================
  // =============  HÀM CHUYỂN CHỮ CÓ DẤU THÀNH KHÔNG DẤU ========
  // =============================================================
  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  // -------- Thêm hàm exportToPDF() --------
  exportToPDF(): void {
    // Kiểm tra dữ liệu
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      this.toastr.warning('Không có dữ liệu để xuất!', 'Cảnh báo');
      return;
    }

    try {
      // Tạo mới instance jsPDF
      const doc = new jsPDF({
        orientation: 'landscape', // 'portrait' hoặc 'landscape'
        unit: 'px',
        format: 'a4'
      });

      // Tạo tiêu đề
      doc.setFontSize(18);
      doc.text('Danh sach nguoi dung ', 40, 40);

      // Chuẩn bị dữ liệu cột cho autoTable
      const head = [
        [
          'ID',
          'Email',
          'Ten dang nhap',
          'Ho va Ten',
          'So Dien Thoai',
          'Quyen',
          'Trang Thai'
        ]
      ];

      // Map data thành mảng 2 chiều
      // Áp dụng removeVietnameseTones() cho từng trường
      const body = this.dataSource.data.map(user => [
        user.userId,
        this.removeVietnameseTones(user.email),
        this.removeVietnameseTones(user.username),
        this.removeVietnameseTones(user.fullName),
        this.removeVietnameseTones(user.phone || '---'),
        Array.isArray(user.roles)
          ? this.removeVietnameseTones(
              user.roles.map(role => role.name).join(', ')
            )
          : '---',
        this.removeVietnameseTones(this.getStatusText(user.status))
      ]);

      // Gọi autoTable để tạo bảng
      autoTable(doc, {
        head,
        body,
        startY: 60,
        styles: {
          fontSize: 12,
          cellPadding: 8
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: '#ffffff'
        },
        margin: { left: 40, right: 40 }
      });

      // Xuất file PDF
      const fileName = `Danh_sach_nguoi_dung_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(fileName);

      this.toastr.success('Xuất file PDF thành công!', 'Thành công');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      this.toastr.error('Không thể xuất file PDF!', 'Lỗi');
    }
  }

}
