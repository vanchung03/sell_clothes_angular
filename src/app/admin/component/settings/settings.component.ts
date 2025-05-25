import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  
  ngOnInit(): void {
            
  }
  features = [
  { name: 'Đa ngôn ngữ', iconClass: 'fas fa-globe', enabled: true },
  { name: 'Quảng cáo Google Shopping', iconClass: 'fab fa-google', enabled: true },
  { name: 'Nhật ký hoạt động', iconClass: 'fas fa-book', enabled: true },
  { name: 'Bán hàng đa kênh', iconClass: 'fas fa-shopping-cart', enabled: true },
  { name: 'Mã khuyến mãi sản phẩm', iconClass: 'fas fa-gift', enabled: true, desc: 'Gói Bán Thá Ga' },
  { name: 'Mua X tặng Y', iconClass: 'fas fa-tags', enabled: true, desc: 'Gói Bán Thá Ga' },
  { name: 'Bộ lọc sản phẩm', iconClass: 'fas fa-filter', enabled: true, desc: 'Gói Bán Thá Ga' },
  { name: 'Khách hàng (CRM cơ bản)', iconClass: 'fas fa-users', enabled: true, desc: 'Gói Bán Thá Ga' },
  { name: 'Landingpage', iconClass: 'fas fa-file-alt', enabled: true, desc: 'Gói Bán Thá Ga' }
];


}
