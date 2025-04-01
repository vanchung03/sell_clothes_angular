import { User } from './User';

export interface ReviewReply {
  replyId?: number;     
  reviewId: number;     
  userId: number;       
  replyContent: string; 
  createdAt?: string;   
  updatedAt?: string;

  // Thêm trường user để hiển thị avatar, username,...
  user?: User;
}
