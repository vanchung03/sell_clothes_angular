import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/service/payment.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-result',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentComponent implements OnInit {
  status: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.status = this.route.snapshot.queryParamMap.get('status');

    if (this.status === 'success') {
      this.toastr.success('Thanh toán thành công! Cảm ơn bạn đã mua hàng 🎉', 'Thành công');
      // setTimeout(() => {
      //   this.router.navigate(['/home']); // Chuyển hướng về trang chủ
      // }, 3000);
    } else if (this.status === 'cancel') {
      this.toastr.warning('Bạn đã hủy thanh toán. Đơn hàng chưa được xác nhận.', 'Thông báo');
      // setTimeout(() => {
      //   this.router.navigate(['/home']); // Chuyển về giỏ hàng
      // }, 3000);
    } else {
      this.toastr.error('Thanh toán thất bại! Vui lòng thử lại hoặc chọn phương thức khác.', 'Lỗi');
      // setTimeout(() => {
      //   this.router.navigate(['/home']); // Chuyển hướng về trang thanh toán
      // }, 3000);
    }
  }
}
