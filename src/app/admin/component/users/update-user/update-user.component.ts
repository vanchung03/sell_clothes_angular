import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/service/user.service';
import { RolesService } from 'src/app/service/roles.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/types/User';
import { Role } from 'src/app/types/roles';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss']
})
export class UpdateUserComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting: boolean = false;
  rolesList: Role[] = [];
  userId!: number;
  avatarPreview: string | null = null;
// Lưu trạng thái ban đầu của user khi modal mở
originalUser: any = {};
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private rolesService: RolesService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<UpdateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {}

  ngOnInit(): void {
    this.userId = this.data.userId;

    this.userForm = this.fb.group({
      username: [], 
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern("^0\\d{9}$")]],
      fullName: ['', Validators.required],
      roles: [[]], 
      status: [1]
    });

    this.loadRoles();
    this.loadUserData();
  }

  // Lấy danh sách roles từ API
  loadRoles(): void {
    this.rolesService.getRoles().subscribe(
      (roles: Role[]) => {
        this.rolesList = roles;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách roles:', error);
        this.toastr.error('Không thể lấy danh sách vai trò!', 'Lỗi');
      }
    );
  }

  // Lấy dữ liệu user từ API
  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe(
      (user: User) => {
        this.originalUser = { ...user }; // ✅ Lưu trạng thái gốc để kiểm tra thay đổi
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          roles: user.roles.map(role => role['roleId']),
          status: user.status
        });
        this.avatarPreview = user.avatar || null;
      },
      (error) => {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
        this.toastr.error('Không thể tải thông tin người dùng!', 'Lỗi');
        this.dialogRef.close();
      }
    );
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin hợp lệ!', 'Cảnh báo');
      return;
    }
  
    this.isSubmitting = true;
  
    const updatedUser = {
      fullName: this.userForm.value.fullName,
      phone: this.userForm.value.phone,
      email: this.userForm.value.email,
      status: this.userForm.value.status
    };
  
    // So sánh dữ liệu cũ và mới, chỉ cập nhật nếu có thay đổi
    if (
      this.originalUser.fullName === updatedUser.fullName &&
      this.originalUser.phone === updatedUser.phone &&
      this.originalUser.email === updatedUser.email &&
      this.originalUser.status === updatedUser.status
    ) {
      this.toastr.info('Không có thay đổi nào được thực hiện.', 'Thông báo');
      this.dialogRef.close(false); // ✅ Đóng modal nhưng không báo cập nhật
      return;
    }
  
    this.userService.updateUser(this.userId, updatedUser).subscribe(
      () => {
        this.isSubmitting = false;
        this.toastr.success('Thông tin người dùng đã được cập nhật!', 'Thành công');
        this.dialogRef.close(true); // ✅ Chỉ gửi `true` khi thực sự có cập nhật
      },
      (error) => {
        console.error('Lỗi khi cập nhật người dùng:', error);
        this.toastr.error('Lỗi khi cập nhật người dùng!', 'Lỗi');
        this.isSubmitting = false;
      }
    );
  }

  
  onClose(): void {
    this.dialogRef.close(false); // ❌ Trả về `false` khi đóng modal mà không cập nhật
  }
}
