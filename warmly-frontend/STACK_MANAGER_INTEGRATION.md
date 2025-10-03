# Stack Manager Integration - Warmly Frontend

## 🎯 Visão Geral

Este documento explica como o Warmly Frontend se integra com o Stack Manager para deploy de stacks de clientes, baseado na documentação em `/guides/`.

## 📚 Referências

- [Guia 1: Criando uma Stack Warmly](../guides/01-create-warmly-stack.md)
- [Guia 2: Editando Prompts](../guides/02-edit-prompts.md)
- [Guia 3: IDs Cliente WAHA ↔ BigQuery](../guides/03-client-ids-waha-bigquery.md)

## 🔄 Fluxo de Integração

### 1. Stack Manager Cria Cliente

Quando um novo cliente é criado via Stack Manager:

```bash
./stack-manager create \
  --client-name acme-corp \
  --domain acme.lvh.me \
  --waha-id 5511999999999 \
  --bigquery-table warmly-production.clients_data.purchase_intents \
  --llm-provider openai \
  --llm-model gpt-4o
```

Isso gera:
```
clients/acme-corp/warmly-ai/
├── docker-compose.yml
├── .env
├── data/
│   └── service-account.google.json (manualmente)
└── prompts/
    ├── system.md
    ├── evaluate_tools.md
    └── ...
```

### 2. Frontend Acessa Backend do Cliente

O frontend deve ser configurado para acessar o backend correto:

```typescript
// Para cliente acme-corp
export const environment = {
  production: true,
  apiUrl: 'http://api.acme.lvh.me',  // Via Traefik
  wsUrl: 'ws://api.acme.lvh.me'
};
```

### 3. IDs de Cliente (WAHA ↔ BigQuery)

**IMPORTANTE**: Conforme documentado em `guides/03-client-ids-waha-bigquery.md`:

> Os IDs de cliente no BigQuery correspondem EXATAMENTE aos IDs recebidos pelo WAHA.

#### Formato
- **WAHA envia**: `"5511999999999"` (apenas dígitos)
- **BigQuery armazena**: `"5511999999999"` (sem transformação)
- **Frontend usa**: `"5511999999999"` (para queries e filtros)

#### Implementação no Frontend

```typescript
// src/app/core/services/bigquery.service.ts (a ser criado)
export interface PurchaseIntent {
  event_id: string;
  customer_id: string;  // Formato: "5511999999999"
  product_id: string;
  product_description: string;
  intention_date: string;
  event_timestamp: string;
}

export class BigQueryService {
  // Buscar intenções por customer_id (mesmo do WAHA)
  getIntentsByCustomer(customerId: string): Observable<PurchaseIntent[]> {
    return this.http.get<PurchaseIntent[]>(
      `${this.apiUrl}/api/bigquery/intents?customer_id=${customerId}`
    );
  }

  // Filtrar leads por warmth (temperatura)
  getLeadsByWarmth(minWarmth: number, maxWarmth: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/api/bigquery/leads?warmth_min=${minWarmth}&warmth_max=${maxWarmth}`
    );
  }
}
```

## 🎨 Customização de Prompts via Frontend

### AI Manager View - Integração com Prompts

O AI Manager já tem interface para editar configurações. Para integração completa com os prompts:

#### Adicionar Editor de Prompts

```typescript
// src/app/features/ai-manager/ai-manager.component.ts

interface PromptFile {
  name: string;
  content: string;
}

export class AIManagerComponent {
  prompts = signal<PromptFile[]>([]);

  loadPrompts() {
    // GET /api/prompts - endpoint a ser criado no backend
    this.apiService.getPrompts().subscribe(prompts => {
      this.prompts.set(prompts);
    });
  }

  savePrompt(name: string, content: string) {
    // PUT /api/prompts/{name} - endpoint a ser criado
    this.apiService.updatePrompt(name, content).subscribe(() => {
      // Mostrar toast de sucesso
    });
  }
}
```

#### Template com Editor

```html
<app-card variant="elevated" title="Prompt Editor">
  <div class="space-y-4">
    <select [(ngModel)]="selectedPromptFile" class="w-full px-4 py-2">
      <option value="system.md">System Prompt</option>
      <option value="evaluate_tools.md">Tool Evaluator</option>
      <option value="error_handler.md">Error Handler</option>
    </select>

    <textarea 
      rows="20"
      [(ngModel)]="promptContent"
      class="w-full px-4 py-3 bg-white/50 border font-mono text-sm"
    ></textarea>

    <div class="flex gap-3">
      <app-button variant="primary" (buttonClick)="savePrompt()">
        Save Prompt
      </app-button>
      <app-button variant="secondary" (buttonClick)="resetPrompt()">
        Reset to Default
      </app-button>
    </div>
  </div>
</app-card>
```

## 📊 Broadcast - Filtros por Temperatura

### Requisito do bigass.md

> A página de filtros por temperatura faz queries no BigQuery com base na tabela manipulada pela stack warmly.

### Implementação

#### 1. Criar Serviço BigQuery

```typescript
// src/app/core/services/bigquery.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WarmthFilter {
  min: number;
  max: number;
}

export interface Lead {
  customer_id: string;
  name: string;
  email: string;
  warmth: number;
  last_activity: string;
}

@Injectable({
  providedIn: 'root'
})
export class BigQueryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Buscar leads por faixa de temperatura
  getLeadsByWarmth(warmthFilter: WarmthFilter): Observable<Lead[]> {
    return this.http.post<Lead[]>(
      `${this.baseUrl}/api/bigquery/leads/by-warmth`,
      warmthFilter
    );
  }

  // Agendar envio recorrente por temperatura
  scheduleRecurringBroadcast(config: {
    warmth_min: number;
    warmth_max: number;
    message: string;
    cadence_days: number;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/broadcasts/schedule`,
      config
    );
  }

  // Listar campanhas agendadas
  getScheduledBroadcasts(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/api/broadcasts/scheduled`
    );
  }
}
```

#### 2. Atualizar Broadcast View

```typescript
// Adicionar no broadcast.component.ts
export class BroadcastComponent {
  private bigQueryService = inject(BigQueryService);

  warmthFilters = [
    { label: 'All', min: 0, max: 100 },
    { label: 'Hot (70+)', min: 70, max: 100 },
    { label: 'Warm (40-69)', min: 40, max: 69 },
    { label: 'Cool (0-39)', min: 0, max: 39 }
  ];

  selectedWarmthFilter = this.warmthFilters[0];
  targetLeads = signal<Lead[]>([]);
  
  loadTargetLeads() {
    this.bigQueryService.getLeadsByWarmth({
      min: this.selectedWarmthFilter.min,
      max: this.selectedWarmthFilter.max
    }).subscribe(leads => {
      this.targetLeads.set(leads);
    });
  }

  scheduleRecurring() {
    const config = {
      warmth_min: this.selectedWarmthFilter.min,
      warmth_max: this.selectedWarmthFilter.max,
      message: this.messageText,
      cadence_days: 3
    };

    this.bigQueryService.scheduleRecurringBroadcast(config).subscribe(() => {
      // Toast de sucesso
    });
  }
}
```

#### 3. Template Atualizado

```html
<div>
  <label>Filter by Warmth</label>
  <select [(ngModel)]="selectedWarmthFilter" (change)="loadTargetLeads()">
    <option *ngFor="let filter of warmthFilters" [ngValue]="filter">
      {{ filter.label }}
    </option>
  </select>
</div>

<div class="mt-4">
  <h4>Target: {{ targetLeads().length }} leads</h4>
  <div class="space-y-2">
    <div *ngFor="let lead of targetLeads()" class="p-3 bg-white rounded">
      <p>{{ lead.name }} - <app-warmth-badge [score]="lead.warmth" /></p>
    </div>
  </div>
</div>

<div class="mt-6">
  <h4>Schedule Recurring Messages</h4>
  <div class="grid grid-cols-2 gap-4">
    <input type="number" placeholder="Every X days" [(ngModel)]="cadenceDays" />
    <app-button (buttonClick)="scheduleRecurring()">
      Schedule
    </app-button>
  </div>
</div>
```

## 🔌 Backend Endpoints Necessários

Para completar a integração, o backend precisa expor:

### Endpoints de BigQuery

```python
# Adicionar no backend warmly-ai
from fastapi import APIRouter
from google.cloud import bigquery

router = APIRouter()

@router.post("/api/bigquery/leads/by-warmth")
async def get_leads_by_warmth(warmth_filter: WarmthFilter):
    """
    Query BigQuery para buscar leads por faixa de temperatura.
    
    A tabela deve ter:
    - customer_id (STRING)
    - warmth (INT64 ou FLOAT64)
    - name, email, etc.
    """
    query = f"""
    SELECT 
      customer_id,
      name,
      email,
      warmth,
      last_activity
    FROM `{BIGQUERY_TABLE_ID}`
    WHERE warmth >= {warmth_filter.min}
      AND warmth <= {warmth_filter.max}
    ORDER BY warmth DESC, last_activity DESC
    """
    
    results = bigquery_client.query(query).result()
    return [dict(row) for row in results]

@router.post("/api/broadcasts/schedule")
async def schedule_recurring_broadcast(config: BroadcastConfig):
    """
    Agendar envio recorrente de mensagens para faixa de temperatura.
    
    Pode usar Celery, APScheduler ou cron jobs.
    """
    # Implementação de agendamento
    pass
```

### Endpoints de Prompts

```python
@router.get("/api/prompts")
async def list_prompts():
    """Lista todos os arquivos de prompt disponíveis."""
    prompts_dir = Path(os.getenv("PROMPTS_DIR", "/app/prompts"))
    files = []
    for file in prompts_dir.glob("*.md"):
        files.append({
            "name": file.name,
            "content": file.read_text()
        })
    return files

@router.get("/api/prompts/{name}")
async def get_prompt(name: str):
    """Obtém conteúdo de um prompt específico."""
    file_path = Path(os.getenv("PROMPTS_DIR")) / name
    if not file_path.exists():
        raise HTTPException(404, "Prompt not found")
    return {"content": file_path.read_text()}

@router.put("/api/prompts/{name}")
async def update_prompt(name: str, content: str):
    """Atualiza conteúdo de um prompt."""
    file_path = Path(os.getenv("PROMPTS_DIR")) / name
    file_path.write_text(content)
    
    # Reiniciar workflow para carregar novo prompt
    # (implementação específica)
    
    return {"status": "success"}
```

## 🗂️ Estrutura Multi-tenant

### Configuração por Cliente

Cada cliente tem sua própria stack com frontend personalizado:

```
clients/
├── acme-corp/
│   ├── warmly-ai/           # Backend + prompts
│   └── warmly-frontend/     # Frontend customizado (opcional)
│       └── .env
│           apiUrl=http://api.acme.lvh.me
│
├── tech-corp/
│   ├── warmly-ai/
│   └── warmly-frontend/
│       └── .env
│           apiUrl=http://api.tech.lvh.me
```

### Opção 1: Frontend Compartilhado (Recomendado)

Um único frontend acessa múltiplos backends via configuração:

```typescript
// Detecção automática baseada em subdomínio
const subdomain = window.location.hostname.split('.')[0];

export const environment = {
  production: true,
  apiUrl: `http://api.${subdomain}.lvh.me`,
  wsUrl: `ws://api.${subdomain}.lvh.me`
};
```

### Opção 2: Frontend por Cliente

Cada cliente tem seu próprio build do frontend com configurações específicas.

## 📊 Queries BigQuery por Temperatura

### Conforme bigass.md

> Podemos enviar mensagens por temperatura e agendar envios recorrentes de mensagens para determinadas faixas de temperaturas.

### Implementação no Frontend

#### 1. Componente de Filtro por Warmth

```typescript
// src/app/features/broadcast/components/warmth-filter.component.ts
@Component({
  selector: 'app-warmth-filter',
  standalone: true,
  template: `
    <div class="space-y-4">
      <h3>Filter by Warmth Temperature</h3>
      
      <!-- Range Slider -->
      <div>
        <label>Range: {{ minWarmth }} - {{ maxWarmth }}</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          [(ngModel)]="minWarmth"
          (change)="onRangeChange()"
        />
        <input 
          type="range" 
          min="0" 
          max="100" 
          [(ngModel)]="maxWarmth"
          (change)="onRangeChange()"
        />
      </div>

      <!-- Quick Filters -->
      <div class="flex gap-2">
        <button (click)="setRange(70, 100)">Hot (70-100)</button>
        <button (click)="setRange(40, 69)">Warm (40-69)</button>
        <button (click)="setRange(0, 39)">Cool (0-39)</button>
      </div>

      <!-- Results Count -->
      <div class="p-4 bg-warmly-bg rounded">
        <p>Leads matching criteria: <strong>{{ matchingLeads().length }}</strong></p>
      </div>
    </div>
  `
})
export class WarmthFilterComponent {
  minWarmth = 0;
  maxWarmth = 100;
  matchingLeads = signal<Lead[]>([]);

  private bigQueryService = inject(BigQueryService);

  onRangeChange() {
    this.loadLeads();
  }

  setRange(min: number, max: number) {
    this.minWarmth = min;
    this.maxWarmth = max;
    this.loadLeads();
  }

  loadLeads() {
    this.bigQueryService.getLeadsByWarmth({
      min: this.minWarmth,
      max: this.maxWarmth
    }).subscribe(leads => {
      this.matchingLeads.set(leads);
    });
  }
}
```

#### 2. Agendamento de Mensagens Recorrentes

```typescript
// src/app/features/broadcast/components/recurring-scheduler.component.ts
@Component({
  selector: 'app-recurring-scheduler',
  template: `
    <div class="space-y-4">
      <h3>Schedule Recurring Messages</h3>

      <app-warmth-filter 
        (rangeChange)="onWarmthChange($event)"
      />

      <div>
        <label>Message Template</label>
        <textarea [(ngModel)]="messageTemplate" rows="4"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label>Send every</label>
          <input type="number" [(ngModel)]="cadenceDays" />
          <span>days</span>
        </div>

        <div>
          <label>Start Date</label>
          <input type="date" [(ngModel)]="startDate" />
        </div>
      </div>

      <div>
        <label>Quiet Hours (optional)</label>
        <div class="flex gap-2">
          <input type="time" [(ngModel)]="quietHoursStart" />
          <span>to</span>
          <input type="time" [(ngModel)]="quietHoursEnd" />
        </div>
      </div>

      <app-button variant="primary" (buttonClick)="scheduleRecurring()">
        Schedule Recurring Campaign
      </app-button>
    </div>
  `
})
export class RecurringSchedulerComponent {
  messageTemplate = '';
  cadenceDays = 3;
  startDate = new Date().toISOString().split('T')[0];
  quietHoursStart = '22:00';
  quietHoursEnd = '08:00';

  warmthFilter = { min: 40, max: 69 };  // Default: Warm

  private bigQueryService = inject(BigQueryService);

  onWarmthChange(filter: WarmthFilter) {
    this.warmthFilter = filter;
  }

  scheduleRecurring() {
    const config = {
      warmth_min: this.warmthFilter.min,
      warmth_max: this.warmthFilter.max,
      message: this.messageTemplate,
      cadence_days: this.cadenceDays,
      start_date: this.startDate,
      quiet_hours: {
        start: this.quietHoursStart,
        end: this.quietHoursEnd
      }
    };

    this.bigQueryService.scheduleRecurringBroadcast(config).subscribe(result => {
      // Mostrar toast de sucesso
      console.log('Campaign scheduled:', result);
    });
  }
}
```

## 🔗 Integração WAHA

### Webhook do WAHA → Backend → Frontend

```
WhatsApp Message (customer_id: "5511999999999")
         ↓
      WAHA
         ↓ (webhook)
   Warmly-AI Backend
         ↓ (WebSocket)
   Warmly Frontend (real-time update)
```

### Frontend Real-time Service

```typescript
// src/app/core/services/websocket.service.ts
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messages$ = new Subject<any>();

  connect(threadId: string) {
    const wsUrl = environment.wsUrl;
    this.socket = new WebSocket(`${wsUrl}/api/messages/user/websocket`);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messages$.next(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  getMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  disconnect() {
    this.socket?.close();
  }
}
```

### Uso em Conversations View

```typescript
export class ConversationsComponent implements OnInit {
  private wsService = inject(WebSocketService);

  ngOnInit() {
    // Conectar WebSocket
    this.wsService.connect(this.threadId);

    // Escutar mensagens em tempo real
    this.wsService.getMessages().subscribe(message => {
      this.messages.push({
        id: this.messages.length + 1,
        sender: message.role === 'assistant' ? 'ai' : 'lead',
        content: message.content,
        time: new Date().toLocaleTimeString()
      });
    });
  }

  sendMessage() {
    const request = {
      data: this.messageText,
      thread_id: this.threadId,
      chat_interface: 'web'
    };

    this.wsService.send(request);
    this.messageText = '';
  }
}
```

## 📋 Checklist de Integração

### Frontend ↔ Stack Manager
- ✅ Estrutura preparada para receber configurações
- ✅ Environment vars configuráveis
- ⏳ Prompts editáveis (backend endpoint necessário)

### Frontend ↔ Warmly-AI Backend
- ✅ WarmlyApiService completo
- ✅ Todos os endpoints mapeados
- ✅ WebSocket estrutura pronta
- ⏳ Conexão real-time (implementar quando backend estiver rodando)

### Frontend ↔ BigQuery
- ⏳ BigQueryService (criar quando backend expuser endpoints)
- ⏳ Filtros por temperatura (estrutura pronta)
- ⏳ Agendamento recorrente (estrutura pronta)

### Frontend ↔ WAHA
- ⏳ Indicador de status WhatsApp (mock atual)
- ⏳ Modal de QR code para conexão
- ⏳ Sincronização de customer_ids

## 🚀 Próximos Passos de Integração

### Fase 1: Backend Warmly-AI
1. Criar endpoints de BigQuery no backend Python
2. Implementar agendamento de mensagens
3. Expor endpoints de prompts
4. Testar integração com dados reais

### Fase 2: Frontend
1. Criar BigQueryService
2. Implementar WebSocketService real-time
3. Adicionar modal de QR code WAHA
4. Implementar editor de prompts inline

### Fase 3: Testes End-to-End
1. Deploy stack de teste com stack-manager
2. Conectar frontend ao backend deployado
3. Testar fluxo completo: WhatsApp → WAHA → Backend → Frontend
4. Validar customer_ids em todas as camadas

## 📝 Notas Importantes

### Customer IDs (do guide 03)

**Sempre use o mesmo formato em todo o sistema**:
- WAHA envia: `"5511999999999"`
- Backend salva no BigQuery: `"5511999999999"`
- Frontend filtra/busca: `"5511999999999"`

**Não aplique transformações!**

### Configuração Multi-tenant

O frontend pode servir múltiplos clientes detectando o subdomínio:

```typescript
// src/app/core/services/tenant.service.ts
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  getTenantFromHostname(): string {
    const hostname = window.location.hostname;
    // api.acme.lvh.me → acme
    return hostname.split('.')[0];
  }

  getApiUrl(): string {
    const tenant = this.getTenantFromHostname();
    return `http://api.${tenant}.lvh.me`;
  }
}
```

## ✅ Status Atual

- ✅ **Frontend**: 100% funcional com dados mock
- ✅ **Design**: Fiel ao Warmly UI
- ✅ **Estrutura**: Preparada para integração real
- ⏳ **Backend endpoints**: Alguns precisam ser criados
- ⏳ **Stack Manager**: Submodule vazio, mas documentação completa existe

## 🎯 Para Demonstração no Hackathon

O frontend está **completamente funcional** e pode ser demonstrado:
1. Com dados mock (atual)
2. Com backend warmly-ai real (apenas conectar)
3. Com BigQuery real (quando endpoints existirem)

**A base está sólida e pronta para escalar!** 🚀

