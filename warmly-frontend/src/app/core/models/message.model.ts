export interface Message {
  id?: string;
  leadId: string;
  sender: 'ai' | 'lead' | 'user';
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'document';
  intent?: string;
  metadata?: any;
  timestamp?: Date;
  read?: boolean;
}

export interface Conversation {
  leadId: string;
  lead: {
    name: string;
    phone: string;
    warmth: number;
  };
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}


