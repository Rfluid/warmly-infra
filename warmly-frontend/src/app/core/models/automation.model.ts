export interface Automation {
  id?: string;
  userId: string;
  name: string;
  type: 'warmth_range' | 'inactivity' | 'drip_sequence';
  active: boolean;
  
  // Filters
  filters: {
    warmthMin?: number;
    warmthMax?: number;
    tags?: Record<string, any>;
    lastActivityDays?: number;
  };
  
  // Schedule
  schedule?: {
    cadenceDays?: number;
    specificDates?: Date[];
    quietHours?: { start: string; end: string };
  };
  
  // Template
  template: string;
  attachments?: string[];
  
  // Stats
  lastRunAt?: Date;
  nextRunAt?: Date;
  successCount: number;
  failCount: number;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BulkMessage {
  id?: string;
  userId: string;
  message: string;
  attachments?: string[];
  
  // Recipients
  recipientFilters: {
    warmthMin?: number;
    warmthMax?: number;
    tags?: Record<string, any>;
    lastActivityDays?: number;
    statuses?: string[];
  };
  
  estimatedRecipients: number;
  actualRecipients?: number;
  
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  
  successCount: number;
  failCount: number;
  
  createdAt?: Date;
}


