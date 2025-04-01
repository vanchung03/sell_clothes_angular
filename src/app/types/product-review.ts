import { User } from './User';
import { ReviewReply } from './review.reply';

export interface ProductReview {
  showActions: boolean;
  reviewId?: number;
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;

  // Thêm trường user để chứa thông tin user (avatar,...)
  user?: User;

  // Thêm trường replies để chứa danh sách reply (FE tạm)
  replies?: ReviewReply[];
}
