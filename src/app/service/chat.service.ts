import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  type: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Getter for messages observable
  get messages$(): Observable<ChatMessage[]> {
    return this.messagesSubject.asObservable();
  }

  // Getter for connection status observable
  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  // Connect to the WebSocket server
  connectToChat(sessionId: string): void {
    const socket = new SockJS(`${this.baseUrl}/ws-chat`);

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.stompClient.onConnect = (frame) => {
      this.connectionStatusSubject.next(true);
      console.log('Connected to WebSocket:', frame);
      
      // Subscribe to the chat topic with the session ID
      this.stompClient?.subscribe(`/topic/chat/${sessionId}`, (response) => {
        const message = JSON.parse(response.body) as ChatMessage;
        const currentMessages = this.messagesSubject.getValue();
        
        // Check if the message is an update to an existing message
        const existingMessageIndex = currentMessages.findIndex(m => m.id === message.id);
        
        if (existingMessageIndex >= 0) {
          // Update existing message
          const updatedMessages = [...currentMessages];
          updatedMessages[existingMessageIndex] = {
            ...message,
            timestamp: new Date(message.timestamp)
          };
          this.messagesSubject.next(updatedMessages);
        } else {
          // Add new message
          this.messagesSubject.next([
            ...currentMessages, 
            {
              ...message,
              timestamp: new Date(message.timestamp)
            }
          ]);
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
    };

    this.stompClient.onWebSocketClose = () => {
      this.connectionStatusSubject.next(false);
      console.log('WebSocket connection closed');
    };

    this.stompClient.activate();
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
    this.connectionStatusSubject.next(false);
  }

  // Send a message to the server
  sendMessage(sessionId: string, message: ChatMessage): void {
    this.http.post<void>(
      `${this.baseUrl}/app/chat.sendMessage/${sessionId}`, 
      message, 
      { withCredentials: true }
    ).subscribe({
      error: (error) => {
        console.error('Error sending message:', error);
        this.addSystemMessage('Failed to send message. Please try again.');
      }
    });
  }

  // Add a system message
  addSystemMessage(content: string): void {
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      sender: 'system',
      type: 'CHAT',
      timestamp: new Date()
    };
    
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, systemMessage]);
  }
  
  // Add an AI message
  addAIMessage(content: string): void {
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      sender: 'ai',
      type: 'CHAT',
      timestamp: new Date()
    };
    
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, aiMessage]);
  }

  // Clear all messages
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
  
  // Remove specific message by index
  removeMessage(index: number): void {
    const currentMessages = this.messagesSubject.getValue();
    if (index >= 0 && index < currentMessages.length) {
      const updatedMessages = [...currentMessages];
      updatedMessages.splice(index, 1);
      this.messagesSubject.next(updatedMessages);
    }
  }
  
  // Update specific message content
  updateMessage(id: string, newContent: string): void {
    const currentMessages = this.messagesSubject.getValue();
    const messageIndex = currentMessages.findIndex(m => m.id === id);
    
    if (messageIndex !== -1) {
      const updatedMessages = [...currentMessages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newContent
      };
      this.messagesSubject.next(updatedMessages);
    }
  }
}