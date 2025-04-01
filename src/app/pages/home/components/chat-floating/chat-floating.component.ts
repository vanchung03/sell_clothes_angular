import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-floating',
  templateUrl: './chat-floating.component.html',
  styleUrls: ['./chat-floating.component.scss']
})
export class ChatFloatingComponent implements OnInit {

  isZaloOpened: boolean = false;
  isMessengerOpened: boolean = false;

  // Dữ liệu mẫu tin nhắn
  zaloMessages = [
    {
      senderName: 'Zalo Support',
      senderAvatar: 'https://i.pravatar.cc/32?img=1',
      text: 'Chào bạn, mình có thể giúp gì cho bạn?',
      time: '08:35'
    },
    {
      senderName: 'Bạn',
      senderAvatar: 'https://i.pravatar.cc/32?img=2',
      text: 'Mình muốn tìm hiểu thêm về sản phẩm.',
      time: '08:36'
    }
  ];

  messengerMessages = [
    {
      senderName: 'Messenger Bot',
      senderAvatar: 'https://i.pravatar.cc/32?img=3',
      text: 'Xin chào, vui lòng cho mình biết yêu cầu của bạn?',
      time: '09:00'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  // Mở / đóng chat Zalo
  toggleZaloChat() {
    this.isZaloOpened = !this.isZaloOpened;
    // Nếu mở Zalo, đóng Messenger
    if (this.isZaloOpened) {
      this.isMessengerOpened = false;
    }
  }

  // Mở / đóng chat Messenger
  toggleMessengerChat() {
    this.isMessengerOpened = !this.isMessengerOpened;
    // Nếu mở Messenger, đóng Zalo
    if (this.isMessengerOpened) {
      this.isZaloOpened = false;
    }
  }

  // Giả lập gửi tin nhắn Zalo
  sendZaloMessage() {
    // Logic gửi tin, vd. push 1 object
    this.zaloMessages.push({
      senderName: 'Bạn',
      senderAvatar: 'https://i.pravatar.cc/32?img=2',
      text: 'Tin nhắn demo gửi Zalo!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  // Giả lập gửi tin nhắn Messenger
  sendMessengerMessage() {
    this.messengerMessages.push({
      senderName: 'Bạn',
      senderAvatar: 'https://i.pravatar.cc/32?img=2',
      text: 'Tin nhắn demo gửi Messenger!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }
}
