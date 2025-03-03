import { Component, OnInit } from '@angular/core';
import { initAOS } from 'src/app/aos-init';

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  mainImage: string;
  images: string[];
  category: string;
  badges: string[];
}

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {
  activeTab: string = 'all';
  collections: Collection[] = [
    {
      id: 1,
      title: 'Spring Elegance 2024',
      subtitle: 'Modern Sophistication',
      description: 'Bộ sưu tập xuân hè sang trọng và tinh tế',
      price: '₫1.299.000',
      mainImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200',
      images: [
        'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800'
      ],
      category: 'new',
      badges: ['new', 'trending']
    },
    {
      id: 2,
      title: 'Urban Style Collection',
      subtitle: 'Street Fashion Redefined',
      description: 'Phong cách đường phố hiện đại và cá tính',
      price: '₫899.000',
      mainImage: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=1200',
      images: [
        'https://images.unsplash.com/photo-1512437011370-3a3537f2e2aa?w=800',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'
      ],
      category: 'hot',
      badges: ['hot', 'bestseller']
    }
  ];

  categories = [
    { id: 'all', name: 'Tất cả', icon: 'fas fa-th-large' },
    { id: 'new', name: 'Mới nhất', icon: 'fas fa-star' },
    { id: 'hot', name: 'Bán chạy', icon: 'fas fa-fire' },
    { id: 'sale', name: 'Giảm giá', icon: 'fas fa-tag' }
  ];
  selectedCollection: Collection | null = null;

  constructor() {}

  ngOnInit() {
    initAOS();
  }
  setActiveTab(categoryId: string): void {
    this.activeTab = categoryId;
    // Optional: Add animation reset for AOS
  }

  filteredCollections(): Collection[] {
    if (this.activeTab === 'all') {
      return this.collections;
    }
    return this.collections.filter(collection => collection.category === this.activeTab);
  }
}