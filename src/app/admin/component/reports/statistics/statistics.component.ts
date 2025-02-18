import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  // 📊 Cấu hình dữ liệu cho Biểu đồ Doanh thu
  revenueChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  revenueChartLabels: string[] = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];
  revenueChartData = {
    labels: this.revenueChartLabels,
    datasets: [
      { data: [500, 1200, 900, 1500, 1800, 2500], label: 'Doanh thu (VNĐ)', backgroundColor: '#007bff' }
    ]
  };

  // 📈 Cấu hình dữ liệu cho Biểu đồ Người dùng mới
  userChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  userChartLabels: string[] = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'];
  userChartData = {
    labels: this.userChartLabels,
    datasets: [
      { data: [30, 45, 60, 80, 120, 150], label: 'Người dùng mới', borderColor: '#28a745', fill: true }
    ]
  };

  constructor() {}

  ngOnInit(): void {}

}
