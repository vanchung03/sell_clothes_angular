import { Component, OnInit } from '@angular/core';
import { StatisticsService } from 'src/app/service/statistics.service';
import Chart from 'chart.js/auto';
import { initAOS } from 'src/assets/aos-init';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0;
  totalOrders: number = 0;



  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    // Khởi tạo thư viện AOS cho hiệu ứng
    initAOS();
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.statisticsService.getTotalRevenue().subscribe(data => this.totalRevenue = data);
    this.statisticsService.getTotalOrders().subscribe(data => this.totalOrders = data);
  }
}