import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/service/report.service';
import * as XLSX from 'xlsx'; // ✅ Xuất Excel
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf'; // ✅ Xuất PDF
import autoTable from 'jspdf-autotable';
import vietnameseFont from './times-new-roman-normal'; // 🔥 Import font tiếng Việt
import { LegendPosition } from '@swimlane/ngx-charts';

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
    this.totalRevenue = data.totalRevenue;
    this.productRevenueList = data.productRevenueList;
  
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

  // 📌 ✅ Xuất báo cáo Excel
  exportToExcel(): void {
    const reportData = this.reportType === 'daily' ? this.dailyRevenueList : this.monthlyRevenueList;
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
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
    ]);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo doanh thu');
    
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(data, `BaoCaoDoanhThu_${this.reportType}_${this.fromDate || this.selectedMonth}.xlsx`);
  }
  loadVietnameseFont(doc: jsPDF) {
    doc.addFileToVFS('times-new-roman-normal.ttf', vietnameseFont); // ✅ Đảm bảo `vietnameseFont` là Base64 đúng
    doc.addFont('times-new-roman-normal.ttf', 'TimesNewRoman', 'normal'); // ✅ Đặt tên font đúng
    doc.setFont('TimesNewRoman'); // ✅ Dùng đúng font đã đăng ký
}

  // 📌 ✅ Xuất báo cáo PDF
//   exportToPDF(): void {
//     const doc = new jsPDF();

//     // ✅ Load font tiếng Việt
//     this.loadVietnameseFont(doc);

//     doc.setFontSize(14);
//     doc.text('📊 Báo cáo doanh thu', 14, 10);
//     doc.setFontSize(12);
//     doc.text(`💰 Tổng doanh thu: ${this.formatNumber(this.totalRevenue)} VNĐ`, 14, 20);

//     const reportData = this.reportType === 'daily' ? this.dailyRevenueList : this.monthlyRevenueList;

//     if (!reportData || reportData.length === 0) {
//         console.warn("⚠️ Không có dữ liệu để xuất PDF!");
//         return;
//     }

//     autoTable(doc, {
//         startY: 30,
//         head: [[this.reportType === 'daily' ? 'Ngày' : 'Tháng', 'Doanh thu (VNĐ)']],
//         body: reportData.map((d) => [this.formatDateOrMonth(d), this.formatNumber(d.revenue)]),
//         styles: { font: 'Times-New-Roman' },
//     });

//     const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 40;

//     autoTable(doc, {
//         startY: finalY,
//         head: [['Sản phẩm', 'Số lượng bán', 'Doanh thu (VNĐ)']],
//         body: this.productRevenueList.map((p) => [p.productName, p.totalQuantitySold, this.formatNumber(p.totalRevenue)]),
//         styles: { font: 'Times-New-Roman' },
//     });

//     doc.save(`BaoCaoDoanhThu_${this.reportType}_${this.fromDate || this.selectedMonth}.pdf`);
// }
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
  doc.text(this.removeVietnameseTones(`💰 Tong doanh thu: ${this.formatNumber(this.totalRevenue)} VND`), 14, 20);

  const reportData = this.reportType === 'daily' ? this.dailyRevenueList : this.monthlyRevenueList;

  if (!reportData || reportData.length === 0) {
      console.warn("⚠️ Khong co du lieu de xuat PDF!");
      return;
  }

  autoTable(doc, {
      startY: 30,
      head: [[this.removeVietnameseTones(this.reportType === 'daily' ? 'Ngay' : 'Thang'), 'Doanh thu (VND)']],
      body: reportData.map((d) => [this.removeVietnameseTones(this.formatDateOrMonth(d)), this.formatNumber(d.revenue)]),
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 40;

  autoTable(doc, {
      startY: finalY,
      head: [[this.removeVietnameseTones('San pham'), this.removeVietnameseTones('So luong ban'), this.removeVietnameseTones('Doanh thu (VND)')]],
      body: this.productRevenueList.map((p) => [this.removeVietnameseTones(p.productName), p.totalQuantitySold, this.formatNumber(p.totalRevenue)]),
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
