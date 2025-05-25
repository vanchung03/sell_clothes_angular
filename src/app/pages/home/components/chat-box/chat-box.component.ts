import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent {
  isOpen = false;
  messages: { role: 'user' | 'ai', content: string }[] = [];
  userInput: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.messages.push({ role: 'user', content: message });
    this.userInput = '';
    this.loading = true;

    this.http.post('http://localhost:8080/api/chat', message, {
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.messages.push({ role: 'ai', content: response });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'ai', content: '❌ Lỗi kết nối đến máy chủ AI.' });
        this.loading = false;
      }
    });
  }

  formatMessage(content: string): string {
  // Escape ký tự HTML
  let escaped = content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tìm và chuyển URL thành thẻ <a>, rút gọn phần hiển thị
  escaped = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    (match) => {
      try {
        const url = new URL(match);
        const pathname = url.pathname; // ví dụ: /product-detail/9
        return `<a href="${match}" target="_blank" style="color: #1976d2; text-decoration: underline;">${pathname}</a>`;
      } catch {
        return match;
      }
    }
  );

  // Xuống dòng và giữ định dạng
  return escaped
    .replace(/\n/g, '<br>')
    .replace(/  /g, '&nbsp;&nbsp;')
    .replace(/^- /gm, '• ')
    .replace(/^\* /gm, '• ');
}

}
