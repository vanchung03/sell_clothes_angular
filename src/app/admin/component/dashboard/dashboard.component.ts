import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderService } from 'src/app/service/order.service';
import { Order } from 'src/app/types/order';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0;
  totalOrders: number = 0;
  orders: Order[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Dữ liệu cho biểu đồ kết hợp (bar + line)
  public combinedChartData: ChartConfiguration<'bar' | 'line'>['data'] = {
    labels: [],
    datasets: [
      {
        type: 'bar',
        label: 'Doanh thu (VNĐ)',
        data: [],
        backgroundColor: '#4CAF50'
      },
      {
        type: 'line',
        label: 'Số đơn hàng',
        data: [],
        borderColor: '#3F51B5',
        fill: false
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Tổng Quan Đơn Hàng Theo Ngày'
      }
    }
  };

  public chartType: ChartType = 'bar';

  // Biểu đồ tròn (pie chart)
  public pieChartLabels: string[] = [];
  public pieChartData: number[] = [];
  public pieChartColors: Array<any> = [
    {
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336', '#2196F3']
    }
  ];

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân Bố Trạng Thái Đơn Hàng'
      }
    }
  };
  
  public pieChartType: ChartType = 'pie';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.orderService.getAllOrders().subscribe((orders) => {
      this.orders = orders;
      this.totalOrders = orders.length;
      this.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

      const dailySummary: { [date: string]: { revenue: number, count: number } } = {};

      orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        if (!dailySummary[date]) {
          dailySummary[date] = { revenue: 0, count: 0 };
        }
        dailySummary[date].revenue += order.totalAmount;
        dailySummary[date].count += 1;
      });

      const sortedDates = Object.keys(dailySummary).sort();

      this.combinedChartData.labels = sortedDates;
      this.combinedChartData.datasets[0].data = sortedDates.map(date => dailySummary[date].revenue);
      this.combinedChartData.datasets[1].data = sortedDates.map(date => dailySummary[date].count);
      this.chart?.update(); // cập nhật biểu đồ kết hợp

      // Xử lý dữ liệu cho pie chart
      const statusCounts: { [status: string]: number } = {};

      orders.forEach(order => {
        const status = order.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      this.pieChartLabels = Object.keys(statusCounts);
      this.pieChartData = Object.values(statusCounts);
    });
  }
}
