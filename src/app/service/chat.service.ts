import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ChatService {  
  // Lấy URL từ environment
  private CHAT_BOX_URL = environment.API_URLS.CHAT_BOX;

  constructor(private http: HttpClient) { }

  // Gửi tin nhắn và nhận phản hồi
  sendMessage(message: string): Observable<string> {
    return this.http.post(this.CHAT_BOX_URL, message, {
      responseType: 'text'  // Đảm bảo phản hồi là chuỗi
    });
  }
}
