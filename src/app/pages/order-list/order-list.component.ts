import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/service/order.service';

interface Order {
  orderId: string;
  orderDate: string;
  shippingFee: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING'| 'COMPLETED' | 'CANCELLED';
}

interface SearchFilters {
  orderId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  // Order data
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  
  // UI states
  isLoading = true;
  errorMessage = '';
  
  // Search filters
  searchFilters: SearchFilters = {
    orderId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };
  
  // Sorting
  sortColumn = 'orderDate';
  sortDirection = 'desc';
  
  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  
  constructor(private orderService: OrderService) { }
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.orderService.getOrdersByUser().subscribe({
      next: (data) => {
        // Transform dates when receiving data
        this.orders = data.map(order => ({
          ...order,
          orderDate: order.orderDate ? new Date(order.orderDate) : new Date()
        }));
        
        // Debug logs
        console.log('Raw first order:', data[0]);
        console.log('Processed first order date:', this.orders[0]?.orderDate);
        
        this.filteredOrders = [...this.orders];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Không thể tải danh sách đơn hàng';
        this.isLoading = false;
      }
    });
  }
  
  parseDate(dateStr: any): string {
    try {
      // Debug log
      console.log('Parsing date value:', dateStr);
  
      if (!dateStr) {
        console.log('Date is null/undefined');
        return "N/A";
      }
  
      let date: Date;
  
      // Handle different date formats
      if (dateStr instanceof Date) {
        date = dateStr;
      } else if (typeof dateStr === "string") {
        // Try parsing ISO string
        date = new Date(dateStr);
      } else if (typeof dateStr === "number") {
        // Handle timestamp
        date = new Date(dateStr);
      } else if (Array.isArray(dateStr)) {
        // Handle array format [year, month, day, ...]
        const [year, month, day, hours = 0, minutes = 0] = dateStr;
        date = new Date(year, month - 1, day, hours, minutes);
      } else {
        console.log('Unsupported date format:', typeof dateStr);
        return "N/A";
      }
  
      // Validate date
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date:", dateStr);
        return "N/A";
      }
  
      // Format date
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
  
      const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
      console.log('Formatted date:', formattedDate);
      
      return formattedDate;
  
    } catch (error) {
      console.error("Error parsing date:", error, "Input:", dateStr);
      return "N/A";
    }
  }
  
  // Filter and search functionality
  searchOrders(): void {
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.searchFilters = {
      orderId: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    this.applyFilters();
  }
  
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filtering
    
    let result = [...this.orders];
    
    // Apply orderId filter
    if (this.searchFilters.orderId) {
      result = result.filter(order => 
        order.orderId.toLowerCase().includes(this.searchFilters.orderId.toLowerCase())
      );
    }
    
    // Apply status filter
    if (this.searchFilters.status) {
      result = result.filter(order => order.status === this.searchFilters.status);
    }
    
    // Apply date filters
    if (this.searchFilters.dateFrom) {
      const fromDate = new Date(this.searchFilters.dateFrom);
      result = result.filter(order => new Date(order.orderDate) >= fromDate);
    }
    
    if (this.searchFilters.dateTo) {
      const toDate = new Date(this.searchFilters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter(order => new Date(order.orderDate) <= toDate);
    }
    
    // Apply sorting
    this.filteredOrders = this.sortOrders(result);
    
    // Update pagination
    this.updatePagination();
  }
  
  // Sorting functionality
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredOrders = this.sortOrders(this.filteredOrders);
    this.updatePagination();
  }
  
  sortOrders(orders: Order[]): Order[] {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortColumn) {
        case 'orderId':
          comparison = a.orderId.localeCompare(b.orderId);
          break;
        case 'orderDate':
          comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
          break;
        case 'shippingFee':
          comparison = a.shippingFee - b.shippingFee;
          break;
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  // Pagination functionality
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
    this.goToPage(this.currentPage);
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, startIndex + this.pageSize);
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  // Utility functions
  viewOrderDetails(orderId: string): void {
    // Navigate to order details page or open modal
    console.log(`Viewing details for order: ${orderId}`);
  }
  @Output() closeModal = new EventEmitter<void>();
  
  // ... existing code ...

  closeOrders() {
    this.closeModal.emit();
  }
  
  
  getStatusText(status: string): string {
    switch (status) {
      case 'COMLETED':
        return 'Hoàn thành';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}