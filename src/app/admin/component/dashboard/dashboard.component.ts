import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Cấu hình dữ liệu cho biểu đồ Sales
  salesData: any[] = [
    {
      data: [65, 59, 80, 81, 56, 55, 40],
      label: 'Sales',
      borderColor: 'rgba(0,123,255,1)',  // Màu đường biên
      backgroundColor: 'rgba(0,123,255,0.2)',  // Màu nền dưới đường
      pointBackgroundColor: 'rgba(0,123,255,1)',  // Màu điểm
      pointBorderColor: '#fff',  // Màu viền điểm
      pointHoverBackgroundColor: '#fff',  // Màu nền khi hover điểm
      pointHoverBorderColor: 'rgba(0,123,255,0.8)',  // Màu viền khi hover điểm
    }
  ];

  salesLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  // Cấu hình dữ liệu cho biểu đồ Customer Growth
  growthData: any[] = [
    {
      data: [50, 55, 60, 65, 70, 75, 80],
      label: 'Customer Growth',
      borderColor: 'rgba(0,255,0,1)',  // Màu đường biên cho biểu đồ khách hàng
      backgroundColor: 'rgba(0,255,0,0.2)',  // Màu nền dưới đường
      pointBackgroundColor: 'rgba(0,255,0,1)',  // Màu điểm
      pointBorderColor: '#fff',  // Màu viền điểm
      pointHoverBackgroundColor: '#fff',  // Màu nền khi hover điểm
      pointHoverBorderColor: 'rgba(0,255,0,0.8)',  // Màu viền khi hover điểm
    }
  ];

  growthLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  // Cấu hình options cho biểu đồ
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          drawOnChartArea: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  // Định nghĩa loại biểu đồ (line và bar)
  lineChartType: string = 'line';
  barChartType: string = 'bar';

  constructor() { }

  ngOnInit(): void {
  }

}
