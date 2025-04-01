import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/service/order.service';
import { UserService } from 'src/app/service/user.service';
import { UserAddressService } from 'src/app/service/user-address.service';
import { OrderItemService } from 'src/app/service/order-item.service';
import { PaymentService } from 'src/app/service/payment.service';
import { Order } from 'src/app/types/order';
import { Payment } from 'src/app/types/payment';
import { OrderItem } from 'src/app/types/order-item';
import { ProductVariantService } from 'src/app/service/product-variant.service';
import { ProductVariant } from 'src/app/types/product-variant';
import { initAOS } from 'src/assets/aos-init';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ShipMethodService } from 'src/app/service/ship-method.service';


// =========== Thư viện xuất PDF ============
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order?: Order;
  payment?: Payment;
  orderItems: OrderItem[] = [];

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private addressService: UserAddressService,
    private orderItemService: OrderItemService,
    private productVariantService: ProductVariantService,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private shipMethodService: ShipMethodService
  ) { }

  ngOnInit(): void {
    initAOS();
    const orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrderDetails(orderId);

  }
  getStatusText(status: string | undefined): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  getPaymentStatusText(status: string | undefined): string {
    if (!status) return 'N/A';
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ thanh toán',
      'COMPLETED': 'Đã thanh toán',
      'FAILED': 'Thất bại'
    };
    return statusMap[status] || status;
  }

  getPaymentIcon(method: string | undefined): string {
    if (!method) return 'fa-question-circle';
    const iconMap: { [key: string]: string } = {
      'COD': 'fa-money-bill',
      'VNPAY': 'fa-credit-card',
      'MOMO': 'fa-wallet',
      'PAYPAL': 'fa-paypal'
    };
    return iconMap[method] || 'fa-credit-card';
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  loadOrderDetails(orderId: number): void {
    // ✅ Lấy thông tin đơn hàng
    this.orderService.getOrderById(orderId).subscribe(order => {
      this.order = order;

      // ✅ Lấy thông tin user
      this.userService.getUserById(order.userId).subscribe(user => this.order!.user = user);

      // ✅ Lấy địa chỉ giao hàng
      this.addressService.getAddressById(order.addressId).subscribe(address => this.order!.address = address);
      // 5) Lấy ShipMethod
      this.shipMethodService.getShipMethodById(order.shipMethodId).subscribe({
        next: (shipMethod) => {
          order.shipMethod = shipMethod; // 🔥 Gán phương thức vận chuyển
        },
        error: (err) => {
          console.warn('Không thể lấy ShipMethod:', err);
        }
      });
      // ✅ Lấy danh sách sản phẩm trong đơn hàng
      this.orderItemService.getOrderItemsByOrderId(orderId).subscribe(items => {
        this.orderItems = items;

        // ✅ Gọi API để lấy chi tiết của từng sản phẩm (variant)
        this.orderItems.forEach(item => {
          this.productVariantService.getVariantById(item.variantId).subscribe(variant => {
            item.variant = variant;
          });
        });
      });

      // ✅ Lấy thông tin thanh toán
      this.paymentService.getPaymentByOrderId(orderId).subscribe(payment => this.payment = payment);
    });
  }
  // ==============================================================
  // =============== XUẤT EXCEL = 2 SHEET =========================
  // ==============================================================
  exportOrderToExcel(): void {
    if (!this.order) {
      console.warn('Chưa có dữ liệu đơn hàng, không thể xuất Excel!');

      return;
    }
    try {
      // 1) Tạo workbook
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();

      // ------------------------------------------------
      // 2) Sheet 1: Thông tin Đơn Hàng (Order Info)
      // ------------------------------------------------
      const orderInfo: (string | number)[][] = [
        ['Mã Đơn Hàng', this.order.orderId || 'N/A'],
        ['Trạng Thái', this.getStatusText(this.order.status)],
        ['Phí Vận Chuyển', this.order.shipMethod.shippingFee ?? 0],
        ['Tổng Tiền', this.order.totalAmount ?? 0],
      ];
      // Thêm thông tin khách hàng, địa chỉ
      orderInfo.push(
        ['Khách Hàng', this.order.user?.fullName || 'N/A'],
        ['Email', this.order.user?.email || 'N/A'],
        ['Điện Thoại', this.order.user?.phone || 'N/A'],
        [
          'Địa Chỉ',
          this.order.address
            ? `${this.order.address.addressLine}, ${this.order.address.district}, ${this.order.address.city}`
            : 'N/A'
        ]
      );
      // Thêm thông tin thanh toán
      if (this.payment) {
        orderInfo.push(
          ['Phương Thức Thanh Toán', this.payment.method || 'N/A'],
          ['Trạng Thái Thanh Toán', this.getPaymentStatusText(this.payment.paymentStatus)],
          ['Số Tiền Thanh Toán', this.payment.amount || 0],
          ['Mã Giao Dịch', this.payment.transactionCode || 'N/A']
        );
      }
      // Tạo worksheet từ AOA
      const wsOrderInfo: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(orderInfo);
      XLSX.utils.book_append_sheet(workbook, wsOrderInfo, 'Order Info');

      // ------------------------------------------------
      // 3) Sheet 2: Danh Sách Sản Phẩm (Order Items)
      // ------------------------------------------------
      const itemsData = this.orderItems.map((item, index) => ({
        'STT': index + 1,
        'Variant ID': item.variantId,
        'Màu Sắc': item.variant?.color || 'N/A',
        'Size': item.variant?.size || 'N/A',
        'SKU': item.variant?.sku || 'N/A',
        'Giá': item.variant?.price || 0,
        'Số Lượng': item.quantity,
        'Thành Tiền': item.totalPrice
      }));
      const wsItems: XLSX.WorkSheet = XLSX.utils.json_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(workbook, wsItems, 'Order Items');

      // 4) Ghi workbook ra buffer rồi lưu file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blobData = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const fileName = `DonHang_${this.order.orderId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blobData, fileName);

      console.log('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
    }
  }

  // ==============================================================
  // =============== XUẤT PDF = 2 BẢNG ============================
  // ==============================================================
  exportOrderToPDF(): void {
    if (!this.order) {
      console.warn('Chưa có dữ liệu đơn hàng, không thể xuất PDF!');
      return;
    }
    try {
      const doc = new jsPDF({
        orientation: 'portrait', // hoặc 'landscape'
        unit: 'px',
        format: 'a4'
      });

      // ===== Tiêu đề chung (bỏ dấu) =====
      const title = this.removeVietnameseTones(`Chi Tiết Đơn Hàng #${this.order.orderId}`);
      doc.setFontSize(16);
      doc.text(title, 40, 40);

      // =========================================================
      // 1) BẢNG THÔNG TIN ĐƠN HÀNG (Order Info)
      // =========================================================
      // Tạo dữ liệu kiểu AOA: [label, value]
      // => Chú ý dùng removeVietnameseTones cho cả label & value
      const orderInfoData: any[][] = [
        [
          this.removeVietnameseTones('Mã Đơn Hàng'),
          this.removeVietnameseTones(String(this.order.orderId || 'N/A'))
        ],
        [
          this.removeVietnameseTones('Trạng Thái'),
          this.removeVietnameseTones(this.getStatusText(this.order.status))
        ],
        [
          this.removeVietnameseTones('Phí Vận Chuyển'),
          this.removeVietnameseTones(String(this.order.shipMethod.shippingFee ?? 0))
        ],
        [
          this.removeVietnameseTones('Tổng Tiền'),
          this.removeVietnameseTones(String(this.order.totalAmount ?? 0))
        ],
        [
          this.removeVietnameseTones('Khách Hàng'),
          this.removeVietnameseTones(this.order.user?.fullName || 'N/A')
        ],
        [
          this.removeVietnameseTones('Email'),
          this.removeVietnameseTones(this.order.user?.email || 'N/A')
        ],
        [
          this.removeVietnameseTones('Điện Thoại'),
          this.removeVietnameseTones(this.order.user?.phone || 'N/A')
        ],
        [
          this.removeVietnameseTones('Địa Chỉ'),
          this.removeVietnameseTones(
            this.order.address
              ? `${this.order.address.addressLine}, ${this.order.address.district}, ${this.order.address.city}`
              : 'N/A'
          )
        ]
      ];

      // Thêm info thanh toán (nếu có)
      if (this.payment) {
        orderInfoData.push(
          [
            this.removeVietnameseTones('Phương Thức Thanh Toán'),
            this.removeVietnameseTones(this.payment.method || 'N/A')
          ],
          [
            this.removeVietnameseTones('Trạng Thái Thanh Toán'),
            this.removeVietnameseTones(this.getPaymentStatusText(this.payment.paymentStatus))
          ],
          [
            this.removeVietnameseTones('Số Tiền Thanh Toán'),
            this.removeVietnameseTones(String(this.payment.amount || 0))
          ],
          [
            this.removeVietnameseTones('Mã Giao Dịch'),
            this.removeVietnameseTones(this.payment.transactionCode || 'N/A')
          ]
        );
      }

      // Chuyển orderInfoData => body 2 cột
      const orderInfoBody = orderInfoData.map(row => [row[0], row[1]]);

      // In bảng "Thông tin đơn hàng" bằng autoTable
      let finalY = 60; // toạ độ Y bắt đầu bảng
      autoTable(doc, {
        head: [[
          this.removeVietnameseTones('Thông Tin'),
          this.removeVietnameseTones('Giá Trị')
        ]],
        body: orderInfoBody,
        startY: finalY,
        styles: { fontSize: 12, cellPadding: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: '#fff' },
        margin: { left: 40, right: 40 }
      });

      // Lấy toạ độ Y kết thúc bảng 1, +20 để xuống dưới 1 chút
      finalY = (doc as any).lastAutoTable.finalY + 20;

      // =========================================================
      // 2) BẢNG DANH SÁCH SẢN PHẨM (Order Items)
      // =========================================================
      const itemHead = [[
        this.removeVietnameseTones('STT'),
        this.removeVietnameseTones('Variant ID'),
        this.removeVietnameseTones('Màu Sắc'),
        this.removeVietnameseTones('Size'),
        this.removeVietnameseTones('SKU'),
        this.removeVietnameseTones('Giá'),
        this.removeVietnameseTones('Số Lượng'),
        this.removeVietnameseTones('Thành Tiền')
      ]];

      const itemBody = this.orderItems.map((item, idx) => [
        this.removeVietnameseTones(String(idx + 1)),
        this.removeVietnameseTones(String(item.variantId)),
        this.removeVietnameseTones(item.variant?.color || 'N/A'),
        this.removeVietnameseTones(item.variant?.size || 'N/A'),
        this.removeVietnameseTones(item.variant?.sku || 'N/A'),
        this.removeVietnameseTones(String(item.variant?.price || 0)),
        this.removeVietnameseTones(String(item.quantity)),
        this.removeVietnameseTones(String(item.totalPrice))
      ]);

      autoTable(doc, {
        head: itemHead,
        body: itemBody,
        startY: finalY,
        styles: { fontSize: 12, cellPadding: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: '#fff' },
        margin: { left: 40, right: 40 }
      });

      // Lưu file PDF
      const fileName = this.removeVietnameseTones(
        `DonHang_${this.order.orderId}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      doc.save(fileName);

      console.log('Xuất PDF KHÔNG DẤU thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
    }
  }
  private removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // xóa các dấu combining mark
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }


}
