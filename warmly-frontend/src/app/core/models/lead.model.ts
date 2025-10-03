export interface Lead {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  lastMsgAt?: Date;
  lastBuyAt?: Date;
  status: 'inactive' | 'active' | 'waiting-contact' | 'won' | 'lost';
  warmth: number; // 0-100
  tags: Record<string, any>; // Dynamic fields
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TagDef {
  id?: string;
  name: string;
  description: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'boolean';
  options?: string[];
  createdAt?: Date;
}

export interface LeadActivity {
  id?: string;
  leadId: string;
  type: 'message' | 'status_change' | 'tag_change' | 'note';
  description: string;
  metadata?: any;
  createdAt?: Date;
}

