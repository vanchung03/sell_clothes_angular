import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from 'src/app/service/chat.service';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/types/products';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  
  isChatVisible: boolean = false;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  sessionId: string = '';
  isConnected: boolean = false;
  username: string = 'User';
  isTyping: boolean = false;
  
  // Thêm biến cho sản phẩm
  relatedProducts: Product[] = [];
  showProducts: boolean = false;
  
  private messagesSubscription?: Subscription;
  private connectionSubscription?: Subscription;
  
  constructor(
    private chatService: ChatService,
    private productService: ProductService
  ) {
    // Tạo session ID khi khởi tạo component
    this.sessionId = crypto.randomUUID();
    
    // Xóa tin nhắn cũ
    this.chatService.clearMessages();
    
    // Thêm tin nhắn chào mừng
    this.chatService.addSystemMessage('👗 Chào mừng bạn đến với Serenity - cửa hàng thời trang hiện đại và phong cách!');
   }
  
  ngOnInit(): void {
    // Đăng ký theo dõi tin nhắn và trạng thái kết nối
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      
      // Kiểm tra tin nhắn mới nhất của người dùng để phân tích
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === this.username) {
          this.analyzeUserMessage(lastMessage.content);
        }
      }
    });
    
    this.connectionSubscription = this.chatService.connectionStatus$.subscribe(isConnected => {
      this.isConnected = isConnected;
    });
    
    // Kết nối với chat
    this.connectToChat();
  }
  
  ngOnDestroy(): void {
    // Dọn dẹp các subscription
    this.messagesSubscription?.unsubscribe();
    this.connectionSubscription?.unsubscribe();
    this.chatService.disconnect();
  }
  
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
  
  connectToChat(): void {
    this.chatService.connectToChat(this.sessionId);
  }
  
  sendMessage(): void {
    if (this.newMessage.trim() !== '' && this.isConnected) {
      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: this.newMessage,
        sender: this.username,
        type: 'CHAT',
        timestamp: new Date()
      };
      
      // Gửi tin nhắn qua service
      this.chatService.sendMessage(this.sessionId, chatMessage);
      this.newMessage = '';
    }
  }
  
  clearChat(): void {
    this.chatService.clearMessages();
    this.relatedProducts = [];
    this.showProducts = false;
  }
  
  toggleChat(): void {
    this.isChatVisible = !this.isChatVisible;
    if (this.isChatVisible) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }
  
  // Phân tích tin nhắn của người dùng để xác định nhu cầu tìm kiếm sản phẩm
  private analyzeUserMessage(message: string): void {
    // Hiển thị trạng thái đang gõ
    this.showTypingIndicator();
    
    // Từ khóa liên quan đến thời trang
    const fashionKeywords = [
      'váy', 'đầm', 'áo', 'quần', 'giày', 'dép', 'túi', 'ví', 'thắt lưng', 'phụ kiện',
      'áo sơ mi', 'áo thun', 'áo phông', 'áo khoác', 'áo len', 'áo dài',
      'quần jean', 'quần âu', 'quần short', 'quần kaki', 'quần jogger',
      'váy dài', 'váy ngắn', 'chân váy', 'đầm dạ hội', 'đầm dự tiệc',
      'giày cao gót', 'giày thể thao', 'giày sandal', 'boot',
      'túi xách', 'túi đeo chéo', 'balo', 'ví cầm tay',
      'thời trang', 'style', 'phong cách', 'xu hướng', 'trend'
    ];
    
    // Chuyển tin nhắn thành chữ thường để dễ so sánh
    const lowerMessage = message.toLowerCase();
    
    // Tìm từ khóa thời trang trong tin nhắn
    let foundKeywords = fashionKeywords.filter(keyword => lowerMessage.includes(keyword));
    
    if (foundKeywords.length > 0) {
      // Nếu tìm thấy từ khóa thời trang, tìm kiếm sản phẩm liên quan
      const searchTerm = foundKeywords[0]; // Lấy từ khóa đầu tiên để tìm kiếm
      this.searchProducts(searchTerm);
    } else if (this.containsProductQuestion(lowerMessage)) {
      // Nếu có câu hỏi về sản phẩm nhưng không có từ khóa cụ thể, tìm kiếm với từ "thời trang"
      this.searchProducts('thời trang');
    }
  }
  
  // Kiểm tra xem tin nhắn có chứa câu hỏi về sản phẩm không
  private containsProductQuestion(message: string): boolean {
    const questionKeywords = [
      'có', 'bán', 'giá', 'bao nhiêu', 'màu', 'size', 'kích thước', 
      'chất liệu', 'mẫu', 'loại', 'hàng', 'sản phẩm', 'đồ', 
      'tư vấn', 'gợi ý', 'recommend', 'tìm', 'mua', 'order', 'đặt'
    ];
    
    return questionKeywords.some(keyword => message.includes(keyword));
  }
  
  // Tìm kiếm sản phẩm từ API
  private searchProducts(keyword: string): void {
    this.productService.searchProducts(keyword).subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 5); // Giới hạn 5 sản phẩm
        this.showProducts = this.relatedProducts.length > 0;
        
        // Tạo phản hồi dựa trên kết quả tìm kiếm
        this.createProductResponse(keyword, this.relatedProducts);
        
        // Ẩn trạng thái đang gõ
        this.hideTypingIndicator();
      },
      error: (error) => {
        console.error('Lỗi khi tìm kiếm sản phẩm:', error);
        
        // Phản hồi lỗi
        this.chatService.addSystemMessage('Rất tiếc, mình không tìm thấy thông tin sản phẩm phù hợp. Bạn có thể mô tả chi tiết hơn không?');
        
        // Ẩn trạng thái đang gõ
        this.hideTypingIndicator();
      }
    });
  }
  
  // Tạo phản hồi về sản phẩm
  private createProductResponse(keyword: string, products: Product[]): void {
    if (products.length === 0) {
      this.chatService.addSystemMessage(`Rất tiếc, mình không tìm thấy sản phẩm "${keyword}" nào. Bạn có thể quan tâm đến sản phẩm khác không?`);
      return;
    }
    
    // Tạo phản hồi với thông tin sản phẩm
    let response = `Mình đã tìm thấy ${products.length} sản phẩm "${keyword}" có thể bạn sẽ thích:\n\n`;
    
    // Không liệt kê sản phẩm trong tin nhắn vì sẽ hiển thị trong card
    response += `Bạn có thể xem chi tiết bên dưới. Bạn có cần thêm thông tin gì về các sản phẩm này không?`;
    
    this.chatService.addSystemMessage(response);
  }
  
  // Hiển thị sản phẩm chi tiết
  showProductDetail(product: Product): void {
    // Hiển thị thông tin chi tiết sản phẩm
    let detailMessage = `📌 Thông tin chi tiết về sản phẩm "${product.name}":\n\n`;
    detailMessage += `💰 Giá: ${product.price.toLocaleString('vi-VN')}đ\n`;
    
    if (product.salePrice && product.salePrice < product.price) {
      const discountPercent = Math.round((1 - product.salePrice / product.price) * 100);
      detailMessage += `🔥 Giá khuyến mãi: ${product.salePrice.toLocaleString('vi-VN')}đ (Giảm ${discountPercent}%)\n`;
    }
    
    detailMessage += `📝 Mô tả: ${product.description}\n\n`;
    detailMessage += `Bạn có muốn đặt mua sản phẩm này không?`;
    
    this.chatService.addSystemMessage(detailMessage);
  }
  
  // Hiển thị trạng thái đang gõ
  private showTypingIndicator(): void {
    this.isTyping = true;
    this.chatService.addSystemMessage('Đang tìm kiếm sản phẩm...');
  }
  
  // Ẩn trạng thái đang gõ
  private hideTypingIndicator(): void {
    this.isTyping = false;
    
    // Xóa tin nhắn "đang tìm kiếm" nếu có
    const currentMessages = this.messages;
    const typingMessageIndex = currentMessages.findIndex(m => 
      m.sender === 'system' && m.content === 'Đang tìm kiếm sản phẩm...'
    );
    
    if (typingMessageIndex !== -1) {
      // Xóa tin nhắn đang gõ
      this.chatService.removeMessage(typingMessageIndex);
    }
  }
}