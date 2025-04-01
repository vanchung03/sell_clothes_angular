// review-reply.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ReviewReply } from '../types/review.reply';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewReplyService {
  private REPLY_URLS = environment.API_URLS.REVIEW_REPLIES;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Lấy tất cả replies
  getAllReplies(): Observable<ReviewReply[]> {
    return this.http.get<ReviewReply[]>(
      this.REPLY_URLS.GET_ALL,
      { headers: this.getAuthHeaders() }
    );
  }

  // Lấy chi tiết 1 reply
  getReplyById(replyId: number): Observable<ReviewReply> {
    return this.http.get<ReviewReply>(
      this.REPLY_URLS.GET_BY_ID(replyId),
      { headers: this.getAuthHeaders() }
    );
  }
  getRepliesByReviewId(reviewId: number): Observable<ReviewReply[]> {
    return this.http.get<ReviewReply[]>(
      this.REPLY_URLS.GET_BY_REVIEW(reviewId),  
      { headers: this.getAuthHeaders() }
    );
  }
  
  

  // Tạo mới reply
  createReply(reply: ReviewReply): Observable<ReviewReply> {
    return this.http.post<ReviewReply>(
      this.REPLY_URLS.CREATE,
      reply,
      { headers: this.getAuthHeaders() }
    );
  }

  // Cập nhật reply
  updateReply(replyId: number, reply: ReviewReply): Observable<ReviewReply> {
    return this.http.put<ReviewReply>(
      this.REPLY_URLS.UPDATE(replyId),
      reply,
      { headers: this.getAuthHeaders() }
    );
  }

  // Xoá reply
  deleteReply(replyId: number): Observable<void> {
    return this.http.delete<void>(
      this.REPLY_URLS.DELETE(replyId),
      { headers: this.getAuthHeaders() }
    );
  }
}
