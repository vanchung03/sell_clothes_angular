import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { RolesService } from 'src/app/service/roles.service';
import { Role } from 'src/app/types/roles';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { initAOS } from 'src/assets/aos-init';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  @ViewChild('editRoleDialog') editRoleDialog!: TemplateRef<any>;

  roles: Role[] = [];
  filteredRoles: Role[] = [];
  roleForm: FormGroup;
  editMode: boolean = false;
  selectedRoleId: number | null = null;
  searchQuery: string = '';

  constructor(
    private rolesService: RolesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getRoles();
    initAOS();
    
  }

  // Get roles count by type
  getAdminRolesCount(): number {
    return this.roles.filter(role => role.name.toLowerCase().includes('admin')).length;
  }

  getUserRolesCount(): number {
    return this.roles.filter(role => role.name.toLowerCase().includes('user')).length;
  }

  // Get role badge class
  getRoleBadgeClass(roleName: string): string {
    const name = roleName.toLowerCase();
    if (name.includes('admin')) return 'admin';
    if (name.includes('user')) return 'user';
    return 'moderator';
  }

  // Handle row click
  onRowClick(role: Role): void {
    this.selectedRoleId = role.roleId;
  }

  // Open add role dialog
  openAddRoleDialog(): void {
    this.editMode = false;
    this.roleForm.reset();
    this.dialog.open(this.editRoleDialog);
  }

  // The rest of your existing methods with enhanced error handling and notifications...
  getRoles() {
    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.filteredRoles = data;
        this.toastr.success('Đã tải danh sách vai trò', 'Thành công');
      },
      error: (error) => {
        this.toastr.error('Không thể tải danh sách vai trò', 'Lỗi');
        console.error('Error loading roles:', error);
      }
    });
  }

  searchRoles() {
    this.filteredRoles = this.roles.filter(role => 
      role.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  addRole() {
    if (this.roleForm.valid) {
      this.rolesService.addRole(this.roleForm.value).subscribe({
        next: () => {
          this.getRoles();
          this.dialog.closeAll();
          this.toastr.success('Thêm vai trò thành công', 'Thành công');
        },
        error: (error) => {
          this.toastr.error('Không thể thêm vai trò', 'Lỗi');
          console.error('Error adding role:', error);
        }
      });
    }
  }

  editRole(role: Role) {
    this.editMode = true;
    this.selectedRoleId = role.roleId;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.dialog.open(this.editRoleDialog);
  }

  updateRole() {
    if (this.selectedRoleId && this.roleForm.valid) {
      this.rolesService.updateRole(this.selectedRoleId, this.roleForm.value).subscribe({
        next: () => {
          this.getRoles();
          this.dialog.closeAll();
          this.toastr.success('Cập nhật vai trò thành công', 'Thành công');
        },
        error: (error) => {
          this.toastr.error('Không thể cập nhật vai trò', 'Lỗi');
          console.error('Error updating role:', error);
        }
      });
    }
  }

  deleteRole(roleId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      this.rolesService.deleteRole(roleId).subscribe({
        next: () => {
          this.getRoles();
          this.toastr.success('Xóa vai trò thành công', 'Thành công');
        },
        error: (error) => {
          this.toastr.error('Không thể xóa vai trò', 'Lỗi');
          console.error('Error deleting role:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.dialog.closeAll();
    this.editMode = false;
    this.selectedRoleId = null;
    this.roleForm.reset();
  }
}