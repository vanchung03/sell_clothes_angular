import { Component, OnInit } from '@angular/core';
import * as AOS from 'aos';

@Component({
  selector: 'app-sale-collections',
  templateUrl: './sale-collections.component.html',
  styleUrls: ['./sale-collections.component.scss']
})
export class SaleCollectionsComponent implements OnInit {
  collections = [
    {
      image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg',
      title: 'Bộ Sưu Tập Xuân Hè',
      description: 'Thời trang tươi trẻ cho mùa mới'
    },
    {
      image: 'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg',
      title: 'Thời Trang Công Sở',
      description: 'Lịch lãm & chuyên nghiệp'
    },
    {
      image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg',
      title: 'Thời Trang Dạo Phố',
      description: 'Sành điệu & thoải mái'
    },
    {
      image: 'https://images.pexels.com/photos/322207/pexels-photo-322207.jpeg',
      title: 'Thời Trang Nam',
      description: 'Cá tính & phong cách'
    }
  ];

  ngOnInit(): void {
    AOS.init({ duration: 800, easing: 'ease-in-out' });
  }
}
