import { Component, Input, OnInit } from '@angular/core';
import { ProductReview } from 'src/app/types/product-review';
import { ProductReviewService } from 'src/app/service/product.review.service';
import { ReviewReply } from 'src/app/types/review.reply';
import { ReviewReplyService } from 'src/app/service/review.reply.service';
import { TokenService } from 'src/app/service/token.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/service/user.service';
import { User } from 'src/app/types/User';
import { initAOS } from 'src/assets/aos-init';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  @Input() productId!: number;

  reviews: ProductReview[] = [];

  // Review mới
  newReview: ProductReview = {
    userId: 0,
    productId: 0,
    rating: 5,
    comment: '',
    showActions: false
  };

  editingReviewId: number | null = null;
  editReviewData: ProductReview = {
    userId: 0,
    productId: 0,
    rating: 5,
    comment: '',
    showActions: false
  };

  // Hiển thị/collapse replies
  showRepliesMap: { [reviewId: number]: boolean } = {};

  // Reply mới
  newReply: ReviewReply = {
    reviewId: 0,
    userId: 0,
    replyContent: ''
  };

  editingReplyId: number | null = null;
  editReplyData: ReviewReply = {
    reviewId: 0,
    userId: 0,
    replyContent: ''
  };

  // Cache user để tránh gọi trùng lặp
  private userCache = new Map<number, User>();

  // ==== Thống kê rating (FE) =====
  averageRating: number = 0;      // Điểm trung bình
  totalReviewsCount: number = 0;  // Tổng số đánh giá
  starDistribution: number[] = [0, 0, 0, 0, 0]; // [số 5 sao, 4 sao, 3 sao, 2 sao, 1 sao]

  constructor(
    private productReviewService: ProductReviewService,
    private reviewReplyService: ReviewReplyService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    initAOS();
    
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.toastr.warning('Bạn cần đăng nhập để tương tác với đánh giá.');
    }
    this.newReview.userId = userId || 0;
    this.newReview.productId = this.productId;

    // Tải danh sách review
    this.loadReviews();
  }

  loadReviews() {
    if (!this.productId) return;

    this.productReviewService.getReviewsByProductId(this.productId).subscribe({
      next: (data) => {
        this.reviews = data;

        // Tạo mảng rỗng replies
        this.reviews.forEach(review => {
          review.replies = [];
          // Lấy avatar user cho review
          this.fetchUserForReview(review);
          // Load replies
          this.loadRepliesForReview(review.reviewId!);
        });

        // Tính thống kê
        this.computeRatingSummary();
      },
      error: (err) => {
        this.toastr.error('Lỗi khi tải đánh giá: ' + err);
      }
    });
  }

  // Tính trung bình rating & phân bố sao
  computeRatingSummary() {
    let sum = 0;
    this.starDistribution = [0, 0, 0, 0, 0]; // reset

    // Đếm rating
    this.reviews.forEach(r => {
      sum += r.rating;
      if (r.rating >= 1 && r.rating <= 5) {
        // rating 5 => index 0
        // rating 4 => index 1 ...
        this.starDistribution[5 - r.rating] += 1;
      }
    });

    this.totalReviewsCount = this.reviews.length;
    if (this.totalReviewsCount > 0) {
      this.averageRating = parseFloat((sum / this.totalReviewsCount).toFixed(1));
    } else {
      this.averageRating = 0;
    }
  }

  // Chọn rating khi thêm review
  selectNewReviewStar(star: number) {
    this.newReview.rating = star;
  }

  // Chọn rating khi edit review
  selectEditReviewStar(star: number) {
    this.editReviewData.rating = star;
  }

  // ====== Lấy user cho review/reply ======
  private fetchUserForReview(review: ProductReview) {
    const userId = review.userId;
    if (!userId) return;

    if (this.userCache.has(userId)) {
      review.user = this.userCache.get(userId);
      return;
    }
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userCache.set(userId, user);
        review.user = user;
      },
      error: (err) => {
        console.error('Không lấy được user:', err);
      }
    });
  }

  private fetchUserForReply(reply: ReviewReply) {
    const userId = reply.userId;
    if (!userId) return;

    if (this.userCache.has(userId)) {
      reply.user = this.userCache.get(userId);
      return;
    }
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userCache.set(userId, user);
        reply.user = user;
      },
      error: (err) => {
        console.error('Không lấy được user:', err);
      }
    });
  }

  loadRepliesForReview(reviewId: number) {
    this.reviewReplyService.getRepliesByReviewId(reviewId).subscribe({
      next: (replyData) => {
        const review = this.reviews.find(r => r.reviewId === reviewId);
        if (review) {
          review.replies = replyData;
          // fetch user cho từng reply
          review.replies.forEach(reply => {
            this.fetchUserForReply(reply);
          });
        }
      },
      error: (err) => {
        this.toastr.error('Lỗi khi tải danh sách trả lời: ' + err);
      }
    });
  }

  // ======== CRUD Review =============
  addReview() {
    this.productReviewService.addReview(this.newReview).subscribe({
      next: () => {
        this.toastr.success('Thêm đánh giá thành công!');
        // reset
        this.newReview.rating = 5;
        this.newReview.comment = '';
        this.loadReviews();
      },
      error: (err) => {
        this.toastr.error('Lỗi khi thêm đánh giá: ' + err);
      }
    });
  }

  startEditReview(review: ProductReview) {
    this.editingReviewId = review.reviewId!;
    this.editReviewData = { ...review };
  }

  cancelEditReview() {
    this.editingReviewId = null;
  }

  updateReview() {
    if (this.editingReviewId == null) return;
    this.productReviewService.updateReview(this.editingReviewId, this.editReviewData).subscribe({
      next: () => {
        this.toastr.success('Cập nhật đánh giá thành công!');
        this.editingReviewId = null;
        this.loadReviews();
      },
      error: (err) => {
        this.toastr.error('Lỗi khi cập nhật đánh giá: ' + err);
      }
    });
  }

  deleteReview(reviewId: number) {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    this.productReviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.toastr.success('Đã xóa đánh giá!');
        this.reviews = this.reviews.filter(r => r.reviewId !== reviewId);
        this.computeRatingSummary();
      },
      error: (err) => {
        this.toastr.error('Lỗi khi xóa đánh giá: ' + err);
      }
    });
  }

  // ======== Hiển thị/collapse reply ========
  toggleReplies(reviewId: number) {
    this.showRepliesMap[reviewId] = !this.showRepliesMap[reviewId];
  }

  // ======== CRUD Reply =============
  addReply(review: ProductReview) {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      this.toastr.warning('Bạn cần đăng nhập để trả lời bình luận.');
      return;
    }
    this.newReply.reviewId = review.reviewId!;
    this.newReply.userId = userId;

    this.reviewReplyService.createReply(this.newReply).subscribe({
      next: () => {
        this.toastr.success('Đã trả lời bình luận!');
        this.newReply.replyContent = '';
        this.loadRepliesForReview(review.reviewId!);
      },
      error: (err) => {
        this.toastr.error('Lỗi khi trả lời bình luận: ' + err);
      }
    });
  }

  startEditReply(reply: ReviewReply) {
    this.editingReplyId = reply.replyId!;
    this.editReplyData = { ...reply };
  }

  cancelEditReply() {
    this.editingReplyId = null;
  }

  updateReply() {
    if (this.editingReplyId == null) return;
    this.reviewReplyService.updateReply(this.editingReplyId, this.editReplyData).subscribe({
      next: (updated) => {
        this.toastr.success('Cập nhật trả lời thành công!');
        this.editingReplyId = null;
        this.loadRepliesForReview(updated.reviewId);
      },
      error: (err) => {
        this.toastr.error('Lỗi khi cập nhật trả lời: ' + err);
      }
    });
  }

  deleteReply(reply: ReviewReply) {
    if (!confirm('Bạn có chắc muốn xóa trả lời này?')) return;
    this.reviewReplyService.deleteReply(reply.replyId!).subscribe({
      next: () => {
        this.toastr.success('Đã xóa trả lời!');
        this.loadRepliesForReview(reply.reviewId);
      },
      error: (err) => {
        this.toastr.error('Lỗi khi xóa trả lời: ' + err);
      }
    });
  }
}
