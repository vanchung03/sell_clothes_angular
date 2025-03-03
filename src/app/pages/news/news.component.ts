import { Component, OnInit } from '@angular/core';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  date: Date;
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  selectedCategory: string = 'all';
  currentPage: number = 1;
  totalPages: number = 5;
  newsPerPage: number = 9;

  // Sample news data
  allNews: NewsItem[] = [
    {
      id: 1,
      title: 'Xu hướng thời trang mùa Xuân 2024',
      excerpt: 'Khám phá những xu hướng thời trang nổi bật nhất mùa Xuân năm nay.',
      content: '...',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
      category: 'trend',
      date: new Date('2024-03-01')
    },
    // Add more news items...
  ];

  filteredNews: NewsItem[] = [];

  constructor() { }

  ngOnInit(): void {
    this.filterNews('all');
  }

  filterNews(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    
    if (category === 'all') {
      this.filteredNews = this.allNews;
    } else {
      this.filteredNews = this.allNews.filter(news => news.category === category);
    }
    
    this.totalPages = Math.ceil(this.filteredNews.length / this.newsPerPage);
    this.updateDisplayedNews();
  }

  changePage(delta: number): void {
    this.currentPage += delta;
    this.updateDisplayedNews();
  }

  private updateDisplayedNews(): void {
    const start = (this.currentPage - 1) * this.newsPerPage;
    const end = start + this.newsPerPage;
    this.filteredNews = this.allNews.slice(start, end);
  }
}