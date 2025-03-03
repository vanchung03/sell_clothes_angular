import { Component } from '@angular/core';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  slides = [
    {
      image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1',
      title: 'Bộ Sưu Tập Mới',
      description: 'Xu hướng thời trang 2024',
    },
    {
      image: 'https://images.pexels.com/photos/6626885/pexels-photo-6626885.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1',
      title: 'Thời Trang Nam',
      description: 'Phong cách & Lịch lãm',
    },
    {
      image: 'https://images.pexels.com/photos/6069552/pexels-photo-6069552.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1',
      title: 'Thời Trang Nữ', 
      description: 'Sang trọng & Quyến rũ',
    },
    {
      image: 'https://images.pexels.com/photos/5872361/pexels-photo-5872361.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1',
      title: 'Sale Sốc 50%',
      description: 'Ưu đãi lớn nhất trong năm',
    },
    {
      image: 'https://images.pexels.com/photos/5868742/pexels-photo-5868742.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1',
      title: 'Phong Cách Trẻ',
      description: 'Năng động & Cá tính',
    }
];

categories = [
    {
      name: 'Áo Nam',
      image: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1'
    },
    {
      name: 'Quần Nam',
      image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1'
    },
    {
      name: 'Đầm Nữ',
      image: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1'
    },
    {
      name: 'Phụ kiện',
      image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1'
    }
];

  currentSlide = 0;

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  onSlideAction(slide: any) {
    console.log('Truy cập:', slide.title);
  }
  getNextSlideIndex(): number {
    return (this.currentSlide + 1) % this.slides.length;
}

getPrevSlideIndex(): number {
    return (this.currentSlide - 1 + this.slides.length) % this.slides.length;
}

goToSlide(index: number): void {
    this.currentSlide = index;
}

ngOnDestroy() {
    // Clear the interval when component is destroyed
    if (this.slideInterval) {
        clearInterval(this.slideInterval);
    }
}

private slideInterval: any;

ngOnInit() {
    this.slideInterval = setInterval(() => {
        this.nextSlide();
    }, 5000);
}
}
