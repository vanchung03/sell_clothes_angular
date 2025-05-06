import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/service/report.service';
import * as XLSX from 'xlsx'; // ✅ Xuất Excel
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf'; // ✅ Xuất PDF
import autoTable from 'jspdf-autotable';
import vietnameseFont from './times-new-roman-normal'; // 🔥 Import font tiếng Việt
import { LegendPosition } from '@swimlane/ngx-charts';
import { Order } from 'src/app/types/order';

@Component({
  selector: 'app-report',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  reportType: string = 'daily'; // ✅ Mặc định là báo cáo theo ngày
  fromDate: string = '';
  toDate: string = '';
  selectedMonth: string = '';

   // ... các biến cũ
   orders: Order[] = []; // <-- Thêm biến này

   // ...

  totalRevenue: number | null = null;
  productRevenueList: any[] = [];
  dailyRevenueList: any[] = [];
  monthlyRevenueList: any[] = [];
  errorMessage: string | null = null;
  loading = false;

  // Dữ liệu cho biểu đồ
  barChartData: any[] = [];
  pieChartData: any[] = [];
  legendPosition: LegendPosition = LegendPosition.Below;
  // Add to your ReportsComponent class
  colorScheme = {
  domain: ['#4361ee', '#3a0ca3', '#4895ef', '#4cc9f0', '#f72585', '#7209b7', '#3f37c9', '#4361ee', '#4895ef']
};

// Animation configurations
chartAnimation = true;



  constructor(private reportService: ReportService) {}

  ngOnInit(): void {}


  getRevenueReport() {
    this.errorMessage = null;
    this.barChartData = []; // ✅ Reset dữ liệu biểu đồ trước khi gọi API
    this.pieChartData = []; // ✅ Reset dữ liệu biểu đồ
  
    if (this.reportType === 'daily' && (!this.fromDate || !this.toDate)) {
      this.errorMessage = 'Vui lòng chọn ngày bắt đầu và ngày kết thúc!';
      return;
    }
  
    if (this.reportType === 'monthly' && !this.selectedMonth) {
      this.errorMessage = 'Vui lòng chọn tháng!';
      return;
    }
  
    this.loading = true;
  
    if (this.reportType === 'daily') {
      this.reportService.getRevenueReport(this.fromDate, this.toDate).subscribe({
        next: (data) => this.processReportData(data),
        error: (err) => this.handleError(err),
      });
    } else {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      this.reportService.getMonthlyRevenue(year, month).subscribe({
        next: (data) => {
          this.processReportData(data);
  
          // ✅ Kiểm tra dữ liệu có tồn tại không
          if (this.monthlyRevenueList.length === 0) {
            console.warn("⚠️ Không có dữ liệu doanh thu tháng!");
          } else {
            // ✅ Cập nhật biểu đồ khi có dữ liệu
            this.barChartData = this.monthlyRevenueList.map((item) => ({
              name: `Tháng ${item.month}/${item.year}`,
              value: item.revenue,
            }));
          }
        },
        error: (err) => this.handleError(err),
      });
    }
  }
  
  

  processReportData(data: any) {
    console.log('Dữ liệu trả về từ server:', data);      // <-- Xem toàn bộ data
  console.log('Danh sách orders:', data.orders);      // <-- Xem riêng order
    this.totalRevenue = data.totalRevenue;
    this.productRevenueList = data.productRevenueList;
     // Lưu orders
     this.orders = data.orders.map(order => {
      // Kiểm tra nếu createdAt là mảng => chuyển sang Date
      if (Array.isArray(order.createdAt) && order.createdAt.length >= 6) {
        const [year, month, day, hour, minute, second] = order.createdAt;
        // Lưu ý: month trong JavaScript chạy từ 0-11, nên phải "month - 1"
        order.createdAt = new Date(year, month - 1, day, hour, minute, second);
      } else {
        // Nếu là string ISO hoặc gì khác, có thể parse kiểu Date(order.createdAt)
        // order.createdAt = new Date(order.createdAt);
      }
    
      // Tương tự cho updatedAt (nếu bạn cần hiển thị):
      if (Array.isArray(order.updatedAt) && order.updatedAt.length >= 6) {
        const [year, month, day, hour, minute, second, millisecond] = order.updatedAt;
        order.updatedAt = new Date(year, month - 1, day, hour, minute, second, millisecond || 0);
      }
    
      return order;
    });
    
  console.log('this.orders sau khi gán:', this.orders); // <-- Kiểm tra biến cục bộ

    if (this.reportType === 'daily') {
      this.dailyRevenueList = data.dailyRevenueList || [];
      this.monthlyRevenueList = [];
  
      if (this.dailyRevenueList.length === 0) {
        console.warn("⚠️ Không có dữ liệu doanh thu theo ngày!");
        this.barChartData = [];
      } else {
        this.barChartData = this.dailyRevenueList.map((item) => ({
          name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          value: item.revenue,
        }));
      }
    } else {
      // ✅ Đổi từ `monthlyRevenueList` → `monthlyRevenueDTOList`
      this.monthlyRevenueList = data.monthlyRevenueDTOList || [];
      this.dailyRevenueList = [];
  
      if (this.monthlyRevenueList.length === 0) {
        console.warn("⚠️ Không có dữ liệu doanh thu theo tháng!");
        this.barChartData = [];
      } else {
        this.barChartData = this.monthlyRevenueList.map((item) => ({
          name: `Tháng ${item.month}/${item.year}`,
          value: item.revenue,
        }));
      }
    }
  
    this.pieChartData = this.productRevenueList.map((item) => ({
      name: item.productName,
      value: item.totalRevenue,
    }));
  
    this.loading = false;
  }
  
  
  

  handleError(err: any) {
    this.errorMessage = err.message;
    this.loading = false;
  }

  exportToExcel(): void {
    const reportData = this.reportType === 'daily' ? this.dailyRevenueList : this.monthlyRevenueList;
  
    // 1) summaryData như cũ: tổng doanh thu, daily/monthly, productRevenueList...
    const summaryData = [
      { "Tổng Doanh Thu": `${this.totalRevenue} VNĐ` },
      {},
      ...reportData.map((d) => ({
        [this.reportType === 'daily' ? 'Ngày' : 'Tháng']: d.date || d.month,
        "Doanh thu (VNĐ)": d.revenue,
      })),
      {},
      ...this.productRevenueList.map((p) => ({
        "Sản phẩm": p.productName,
        "Số lượng bán": p.totalQuantitySold,
        "Doanh thu (VNĐ)": p.totalRevenue,
      })),
      {},
      { "Danh sách đơn hàng": "" }, 
    ];
  
    // 2) Gộp danh sách Orders + OrderItems
    const ordersAndItems: any[] = [];
  
    this.orders.forEach((o) => {
      // Thêm 1 dòng "thông tin Order"
      ordersAndItems.push({
        "Mã đơn": o.orderId,
        "User ID": o.userId,
        "Ngày tạo": this.formatDateTime(o.createdAt),
        "Số tiền (VNĐ)": o.totalAmount,
        "Trạng thái": o.status
      });
  
      // Nếu có orderItems
      if (o.orderItems && o.orderItems.length > 0) {
        // Thêm 1 dòng "tiêu đề" cho OrderItem
        ordersAndItems.push({
          "Mã đơn": "→ Chi tiết OrderItem:",
        });
  
        o.orderItems.forEach((item, idx) => {
          ordersAndItems.push({
            "Mã đơn": `  - Sản phẩm #${idx + 1}`,
            "User ID": `VariantID: ${item.variantId}`,
            "Ngày tạo": `SL: ${item.quantity}`,
            "Số tiền (VNĐ)": `Giá: ${item.unitPrice}`,
            "Trạng thái": `Tổng: ${item.totalPrice}`
          });
        });
        // Dòng trống sau mỗi order
        ordersAndItems.push({});
      } else {
        ordersAndItems.push({ "Mã đơn": "→ (Không có OrderItem)" });
        ordersAndItems.push({});
      }
    });
  
    // 3) Gộp chung tất cả vào 1 mảng final
    const excelData = [...summaryData, ...ordersAndItems];
  
    // 4) Tạo Worksheet từ mảng excelData
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
  
    // 5) Tạo Workbook và append sheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo doanh thu');
  
    // 6) Ghi file Excel
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    saveAs(data, `BaoCaoDoanhThu_${this.reportType}_${this.fromDate || this.selectedMonth}.xlsx`);
  }
  

  
  private formatDateTime(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
removeVietnameseTones(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
            .replace(/đ/g, "d").replace(/Đ/g, "D") // Chuyển đ -> d
            .replace(/[^a-zA-Z0-9 ]/g, ""); // Xóa các ký tự đặc biệt
}
exportToPDF(): void {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(this.removeVietnameseTones('📊 Báo cáo doanh thu'), 14, 10);
  doc.setFontSize(12);
  doc.text(
    this.removeVietnameseTones(`💰 Tong doanh thu: ${this.formatNumber(this.totalRevenue)} VND`), 
    14, 
    20
  );

  const reportData = this.reportType === 'daily' ? this.dailyRevenueList : this.monthlyRevenueList;

  if (!reportData || reportData.length === 0) {
    console.warn("⚠️ Khong co du lieu de xuat PDF!");
    return;
  }

  // Bảng 1: Thống kê daily/monthly
  autoTable(doc, {
    startY: 30,
    head: [
      [this.removeVietnameseTones(this.reportType === 'daily' ? 'Ngay' : 'Thang'), 'Doanh thu (VND)']
    ],
    body: reportData.map((d) => [
      this.removeVietnameseTones(this.formatDateOrMonth(d)), 
      this.formatNumber(d.revenue)
    ]),
  });

  let finalY = (doc as any).lastAutoTable.finalY + 10;

  // Bảng 2: Doanh thu theo sản phẩm
  autoTable(doc, {
    startY: finalY,
    head: [[
      this.removeVietnameseTones('San pham'), 
      this.removeVietnameseTones('So luong ban'), 
      this.removeVietnameseTones('Doanh thu (VND)')
    ]],
    body: this.productRevenueList.map((p) => [
      this.removeVietnameseTones(p.productName), 
      p.totalQuantitySold, 
      this.formatNumber(p.totalRevenue)
    ]),
  });

  finalY = (doc as any).lastAutoTable.finalY + 10;

  // Bảng 3: Danh sách Orders (chỉ tóm tắt)
  if (this.orders && this.orders.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [[
        this.removeVietnameseTones('Ma don'),
        this.removeVietnameseTones('User ID'),
        this.removeVietnameseTones('Ngay tao'),
        this.removeVietnameseTones('So tien (VND)'),
        this.removeVietnameseTones('Trang thai'),
      ]],
      body: this.orders.map((o) => [
        o.orderId,
        o.userId,
        this.removeVietnameseTones(this.formatDateTime(o.createdAt)),
        this.formatNumber(o.totalAmount),
        this.removeVietnameseTones(o.status || '')
      ]),
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;
  }

  // (Mới) Bảng 4: In chi tiết OrderItem cho từng order
  this.orders.forEach((order, index) => {
    // Chỉ in nếu có orderItems
    if (order.orderItems && order.orderItems.length > 0) {
      // Tạo 1 heading cho Order
      doc.setFontSize(12);
      doc.text(
        this.removeVietnameseTones(`→ Items của đơn hàng #${order.orderId}`), 
        14, 
        finalY
      );
      finalY += 5; // xuống 5px

      autoTable(doc, {
        startY: finalY,
        head: [[
          this.removeVietnameseTones('VariantID'),
          this.removeVietnameseTones('SL'),
          this.removeVietnameseTones('Unit Price'),
          this.removeVietnameseTones('Total Price'),
        ]],
        body: order.orderItems.map((item) => [
          item.variantId,
          item.quantity,
          this.formatNumber(item.unitPrice),
          this.formatNumber(item.totalPrice),
        ]),
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    }
  });

  doc.save(`BaoCaoDoanhThu_${this.reportType}_${this.fromDate || this.selectedMonth}.pdf`);
}



  // ✅ Định dạng số với dấu phân tách hàng nghìn
  formatNumber(value: number | null): string {
    return value ? new Intl.NumberFormat('vi-VN').format(value) : '0';
  }

  // ✅ Định dạng ngày hoặc tháng/năm
  formatDateOrMonth(d: any): string {
    return this.reportType === 'daily' ? new Date(d.date).toLocaleDateString('vi-VN') : `Tháng ${d.month}/${d.year}`;
  }
}
