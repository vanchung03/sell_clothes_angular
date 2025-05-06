export enum MessageType {
    CHAT = 'CHAT',
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    TYPING = 'TYPING'
  }
  
  export interface ChatMessage {
    id?: string;
    content: string;
    sender: string;
    type: MessageType;
    timestamp?: Date;
  }