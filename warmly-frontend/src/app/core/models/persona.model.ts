export interface Persona {
  id?: string;
  userId: string;
  name: string;
  speakerRole: 'human' | 'brand';
  company: string;
  industry: string;
  languages: string[];
  addressForm: string;
  
  // Tone & Style
  tone: string[];
  emojiLevel: 'none' | 'low' | 'medium' | 'high';
  regionalisms?: string;
  favoritePhrases?: string[];
  bannedPhrases?: string[];
  
  // About Company
  summary: string;
  socialProof?: string[];
  promisesBanned?: string[];
  
  // Compliance
  compliance: {
    lgpdOptout: string[];
    allowLinks: boolean;
    noTotals: boolean;
    regionalPricing: boolean;
  };
  
  // Pricing
  pricing: {
    minOrder?: number;
    negotiationPolicy?: string;
    sendCatalogWhen?: 'onAsk' | 'ask' | 'onProductOrPrice' | 'never';
  };
  
  topProducts?: string[];
  safetyRules?: string[];
  
  // Conversation Playbook
  conversation: {
    opening: string;
    diagnostics: string[];
    allowImage: boolean;
    allowAudio: boolean;
    objections: Array<{ name: string; reply: string }>;
    dealTriggers: string[];
    handoffOrder: string[];
  };
  
  // Automation
  automation: {
    warmthThreshold: number;
    followups: Array<{
      warmthMin: number;
      warmthMax: number;
      cadenceDays: number;
      template: string;
    }>;
    quietHours?: string;
    rateLimit?: string;
  };
  
  // Compiled outputs
  compiled?: {
    yaml: string;
    systemPrompt: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PersonaWizardData extends Partial<Persona> {
  currentStep?: number;
}


