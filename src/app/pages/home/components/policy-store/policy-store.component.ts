import { Component, OnInit } from '@angular/core';
import AOS from 'aos';

@Component({
  selector: 'app-policy-store',
  templateUrl: './policy-store.component.html',
  styleUrls: ['./policy-store.component.scss']
})
export class PolicyStoreComponent implements OnInit {
  policies = [
    { icon: 'fa-gift', title: 'Miễn phí vận chuyển', desc: 'Cho tất cả đơn hàng trong nước' },
    { icon: 'fa-truck', title: 'Miễn phí đổi - trả', desc: 'Đổi với sản phẩm lỗi hoặc vận chuyển' },
    { icon: 'fa-headset', title: 'Hỗ trợ nhanh chóng', desc: 'Gọi 19006750 để được hỗ trợ ngay' },
    { icon: 'fa-user-plus', title: 'Ưu đãi thành viên', desc: 'Đăng ký thành viên nhận nhiều ưu đãi' }
  ];

  ngOnInit(): void {
    AOS.init({ duration: 800, easing: 'ease-in-out' });
  }
}
