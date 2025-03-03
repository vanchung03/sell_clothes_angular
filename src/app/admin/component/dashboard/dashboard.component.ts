import { Component, OnInit } from '@angular/core';
import { StatisticsService } from 'src/app/service/statistics.service';
import Chart from 'chart.js/auto';
import { initAOS } from 'src/app/aos-init';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0;
  totalOrders: number = 0;
  orderStatusData: any[] = [];
  paymentMethodData: any[] = [];
  topProducts: any[] = [];
  revenueChart: any;
  orderStatusChart: any;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    // Khởi tạo thư viện AOS cho hiệu ứng
    initAOS();
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.statisticsService.getTotalRevenue().subscribe(data => this.totalRevenue = data);
    this.statisticsService.getTotalOrders().subscribe(data => this.totalOrders = data);
    
    this.statisticsService.getOrderStatusRatio().subscribe(data => {
      this.orderStatusData = this.processOrderStatusData(data);
      this.loadOrderStatusChart(this.orderStatusData);
    });
    
    this.statisticsService.getPopularPaymentMethods().subscribe(data => {
      this.paymentMethodData = this.processPaymentMethodData(data);
    });
    
    this.statisticsService.getTopSellingProducts().subscribe(data => this.topProducts = data);
    
    this.statisticsService.getRevenueByDate().subscribe(data => this.loadRevenueChart(data));
  }

  // Xử lý dữ liệu trạng thái đơn hàng
  processOrderStatusData(data: any[]): any[] {
    const colors = ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b', '#36b9cc'];
    
    return data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  }

  // Xử lý dữ liệu phương thức thanh toán
  processPaymentMethodData(data: any[]): any[] {
    const icons = ['fas fa-credit-card', 'fas fa-wallet', 'fas fa-money-bill-alt', 'fas fa-mobile-alt'];
    
    return data.map((item, index) => ({
      ...item,
      icon: icons[index % icons.length]
    }));
  }

  loadRevenueChart(data: any[]): void {
    const labels = data.map(item => item[0]);
    const revenue = data.map(item => item[1]);
    
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu theo ngày',
          data: revenue,
          backgroundColor: 'rgba(78, 115, 223, 0.2)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 2,
          tension: 0.3, // Làm mềm đường line
          pointRadius: 3,
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 5,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#5a5c69',
            bodyColor: '#5a5c69',
            borderColor: '#e3e6f0',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return 'Doanh thu: ' + context.parsed.y.toLocaleString() + ' VND';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              borderDash: [2],
              drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' VND';
              }
            }
          }
        }
      }
    });
  }

  loadOrderStatusChart(data: any[]): void {
    const ctx = document.getElementById('orderStatusChart') as HTMLCanvasElement;
    if (!ctx) return;
    
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color);
    
    this.orderStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: '#5a5c69',
            bodyColor: '#5a5c69',
            borderColor: '#e3e6f0',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }
}