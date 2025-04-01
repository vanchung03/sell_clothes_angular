import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit, OnDestroy {
  
  // Dữ liệu slides mới với thiết kế và nội dung mới
  slides = [
    {
      image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1920&h=1080',
      title: 'Xuân - Hè 2025',
      description: 'Khám phá bộ sưu tập mới - Nơi phong cách gặp gỡ sự thoải mái cho ngày nắng mới',
      buttonText: 'Khám phá ngay'
    },
    {
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1920&h=1080',
      title: 'Thời Trang Công Sở',
      description: 'Sang trọng & Thanh lịch - Nâng tầm phong cách làm việc của bạn với những thiết kế hiện đại',
      buttonText: 'Mua sắm ngay'
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&h=1080',
      title: 'Phong Cách Dạo Phố',
      description: 'Tự tin tỏa sáng mọi lúc mọi nơi với những set đồ đường phố trendy nhất 2025',
      buttonText: 'Xem bộ sưu tập'
    }
  ];
  
  // Danh mục sản phẩm mới với thiết kế và hình ảnh đẹp hơn
  categories = [
    {
      name: 'Áo Sơ Mi',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&h=1000'
    },
    {
      name: 'Quần & Jeans',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&h=1000'
    },
    {
      name: 'Váy & Đầm',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&h=1000'
    },
    {
      name: 'Phụ Kiện',
      image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=800&h=1000'
    }
  ];

  currentSlide = 0;
  private slideInterval: any;
  private isAnimating = false;
  
  ngOnInit() {
    // Tự động chuyển slide với interval 7 giây - thời gian dài hơn để
    // người dùng có thể đọc nội dung và xem animation
    this.startSlideInterval();
    
    // Thêm event listener cho mouseenter/mouseleave để tạm dừng auto slide khi hover
    const slider = document.querySelector('.home-slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => this.pauseSlider());
      slider.addEventListener('mouseleave', () => this.resumeSlider());
    }
  }

  ngOnDestroy() {
    // Clear the interval when component is destroyed
    this.clearSlideInterval();
    
    // Remove event listeners
    const slider = document.querySelector('.home-slider');
    if (slider) {
      slider.removeEventListener('mouseenter', () => this.pauseSlider());
      slider.removeEventListener('mouseleave', () => this.resumeSlider());
    }
  }
  
  startSlideInterval() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 7000);
  }
  
  clearSlideInterval() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }
  
  pauseSlider() {
    this.clearSlideInterval();
  }
  
  resumeSlider() {
    if (!this.slideInterval) {
      this.startSlideInterval();
    }
  }

  nextSlide() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    
    // Reset animation state after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800); // Match transition duration in CSS
    
    this.resetSlideInterval();
  }

  prevSlide() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    
    // Reset animation state after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800); // Match transition duration in CSS
    
    this.resetSlideInterval();
  }
  
  resetSlideInterval() {
    this.clearSlideInterval();
    this.startSlideInterval();
  }

  onSlideAction(slide: any) {
    console.log('Truy cập:', slide.title);
    // Thêm tính năng điều hướng hoặc mã xử lý khác tại đây
  }
  
  getNextSlideIndex(): number {
    return (this.currentSlide + 1) % this.slides.length;
  }

  getPrevSlideIndex(): number {
    return (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentSlide) return;
    
    this.isAnimating = true;
    this.currentSlide = index;
    
    // Reset animation state after transition completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 800); // Match transition duration in CSS
    
    this.resetSlideInterval();
  }
}