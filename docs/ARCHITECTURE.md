# TerraShaper Pro - System Architecture

## Overview

TerraShaper Pro is a modern landscape design platform built with a microservices-oriented monorepo architecture. The system enables users to create detailed landscape designs with AI-powered rendering capabilities.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App - Next.js]
        Client[Client Portal]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway - tRPC]
        Auth[Clerk Authentication]
    end
    
    subgraph "Processing Layer"
        RenderWorker[Render Worker]
        AIService[AI Service]
        Queue[Queue System - BullMQ]
    end
    
    subgraph "Data Layer"
        Supabase[(Supabase Database)]
        Storage[(Google Cloud Storage)]
        Redis[(Redis Cache)]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        GoogleImagen[Google Imagen API]
        Stripe[Stripe Billing]
        Sentry[Sentry Monitoring]
    end
    
    Web --> Gateway
    Client --> Gateway
    Gateway --> Auth
    Gateway --> Queue
    Queue --> RenderWorker
    RenderWorker --> AIService
    AIService --> OpenAI
    AIService --> GoogleImagen
    RenderWorker --> Storage
    Gateway --> Supabase
    RenderWorker --> Supabase
    Queue --> Redis
    Gateway --> Stripe
    Web --> Sentry
    RenderWorker --> Sentry
```

## Monorepo Structure

```
TerraShaperPro/
├── apps/                           # Application workspaces
│   ├── web/                       # Next.js frontend application
│   ├── api-gateway/              # tRPC API gateway
│   └── render-worker/            # Background render processing
├── packages/                      # Shared packages
│   ├── ai-service/              # AI provider abstractions
│   ├── db/                      # Database utilities
│   ├── queue/                   # Queue management
│   ├── storage/                 # File storage utilities
│   ├── shared/                  # Common utilities
│   ├── scripts/                 # Build/deploy scripts
│   └── stripe/                  # Billing integration
└── docs/                         # Documentation
```

## Core Services Architecture

### 1. Web Application (Next.js)

**Purpose**: User-facing application with design tools and project management.

```mermaid
graph LR
    subgraph "Frontend Components"
        Canvas[Design Canvas]
        Plants[Plant Library]
        Projects[Project Management]
        Billing[Billing Dashboard]
    end
    
    subgraph "Client Features"
        Auth[Authentication]
        Realtime[Real-time Updates]
        Export[Export Tools]
    end
    
    Canvas --> Auth
    Plants --> Auth
    Projects --> Realtime
    Billing --> Export
```

**Key Technologies**:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Clerk Authentication
- tRPC Client

### 2. API Gateway (tRPC)

**Purpose**: Centralized API layer handling authentication, validation, and routing.

```mermaid
graph TB
    subgraph "API Routers"
        ProjectRouter[Project Router]
        PlantRouter[Plant Router]
        RenderRouter[Render Router]
        BillingRouter[Billing Router]
        TeamRouter[Team Router]
    end
    
    subgraph "Middleware"
        Auth[Authentication]
        RateLimit[Rate Limiting]
        Validation[Input Validation]
        Metrics[Metrics Collection]
    end
    
    Auth --> ProjectRouter
    RateLimit --> PlantRouter
    Validation --> RenderRouter
    Metrics --> BillingRouter
    Auth --> TeamRouter
```

**Key Features**:
- Type-safe API contracts
- Automatic input validation
- Rate limiting and security
- Comprehensive error handling
- Metrics and monitoring

### 3. Render Worker (Background Processing)

**Purpose**: Handles AI-powered landscape rendering with quality control.

```mermaid
graph TB
    subgraph "Render Workflow"
        Queue[Job Queue]
        Coordinator[Render Coordinator]
        Credit[Credit Service]
        Quality[Quality Service]
        Storage[Storage Service]
    end
    
    subgraph "AI Providers"
        OpenAI[OpenAI DALL-E]
        Imagen[Google Imagen]
    end
    
    Queue --> Coordinator
    Coordinator --> Credit
    Coordinator --> Quality
    Coordinator --> Storage
    Coordinator --> OpenAI
    Coordinator --> Imagen
```

**Recent Refactoring** (423 LOC → 4 focused services):
- **CreditService**: Billing and credit operations
- **RenderStorageService**: GCS storage and thumbnail creation
- **RenderQualityService**: Quality checks and review queue
- **RenderCoordinator**: Orchestrates the complete workflow

### 4. AI Service Package

**Purpose**: Abstracts AI provider implementations with consistent interfaces.

```mermaid
graph LR
    subgraph "AI Service Components"
        ProviderManager[Provider Manager]
        PromptGenerator[Prompt Generator]
        QualityChecker[Quality Checker]
        ReviewQueue[Review Queue]
    end
    
    subgraph "Provider Implementations"
        OpenAIProvider[OpenAI Provider]
        ImagenProvider[Imagen Provider]
    end
    
    ProviderManager --> OpenAIProvider
    ProviderManager --> ImagenProvider
    PromptGenerator --> ProviderManager
    QualityChecker --> ReviewQueue
```

## Data Architecture

### Database Schema (Supabase)

```mermaid
erDiagram
    users {
        uuid id PK
        string email
        string name
        timestamp created_at
    }
    
    organizations {
        uuid id PK
        string name
        string subscription_tier
        integer credits_balance
        timestamp created_at
    }
    
    projects {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        string name
        jsonb design_data
        timestamp created_at
    }
    
    renders {
        uuid id PK
        uuid project_id FK
        string status
        string quality_status
        string image_url
        string thumbnail_url
        jsonb metadata
        timestamp created_at
    }
    
    plants {
        uuid id PK
        string name
        string category
        jsonb attributes
        string image_url
    }
    
    users ||--o{ projects : creates
    organizations ||--o{ projects : owns
    projects ||--o{ renders : generates
```

### File Storage (Google Cloud Storage)

```
gs://terrashaper-assets/
├── renders/
│   └── {project-id}/
│       ├── {render-id}.{format}
│       └── {render-id}_thumb.webp
├── plants/
│   └── {plant-id}/
│       ├── main.png
│       └── thumb.webp
└── projects/
    └── {project-id}/
        └── exports/
            └── {export-id}.{format}
```

## Security Architecture

### Authentication & Authorization

```mermaid
graph TB
    subgraph "Authentication Flow"
        User[User]
        Clerk[Clerk Auth]
        JWT[JWT Token]
        API[API Gateway]
    end
    
    subgraph "Authorization Levels"
        UserLevel[User Level]
        OrgLevel[Organization Level]
        ResourceLevel[Resource Level]
    end
    
    User --> Clerk
    Clerk --> JWT
    JWT --> API
    API --> UserLevel
    API --> OrgLevel
    API --> ResourceLevel
```

### Security Headers & Policies

- **CSP**: Strict content security policy
- **CORS**: Controlled cross-origin requests
- **Rate Limiting**: Per-user and per-endpoint limits
- **Input Validation**: Comprehensive data validation
- **RLS**: Row-level security in Supabase

## Performance & Scalability

### Caching Strategy

```mermaid
graph LR
    subgraph "Cache Layers"
        Browser[Browser Cache]
        CDN[Vercel CDN]
        Redis[Redis Cache]
        Database[Database Cache]
    end
    
    subgraph "Cache Types"
        Static[Static Assets]
        API[API Responses]
        Renders[Render Results]
        Plants[Plant Data]
    end
    
    Browser --> Static
    CDN --> Static
    Redis --> API
    Redis --> Renders
    Database --> Plants
```

### Queue Processing

- **BullMQ**: Redis-backed job queue
- **Concurrency**: Configurable worker concurrency
- **Retry Logic**: Exponential backoff for failures
- **Monitoring**: Real-time queue metrics

## Monitoring & Observability

### Error Tracking (Sentry)

```mermaid
graph TB
    subgraph "Error Sources"
        Web[Web App Errors]
        API[API Errors]
        Worker[Worker Errors]
    end
    
    subgraph "Sentry Integration"
        Capture[Error Capture]
        Context[Error Context]
        Alerts[Alert Rules]
    end
    
    Web --> Capture
    API --> Capture
    Worker --> Capture
    Capture --> Context
    Context --> Alerts
```

### Metrics Collection

- **Application Metrics**: Custom business metrics
- **Infrastructure Metrics**: Server and database performance
- **User Metrics**: Usage patterns and engagement
- **Queue Metrics**: Job processing statistics

## Development Workflow

### Package Management

- **npm workspaces**: Monorepo package management
- **Turbo**: Build system and task runner
- **TypeScript**: Strict type checking across packages
- **ESLint**: Consistent code style

### Testing Strategy

```mermaid
graph TB
    subgraph "Test Types"
        Unit[Unit Tests]
        Integration[Integration Tests]
        E2E[E2E Tests - Playwright]
        Visual[Visual Regression Tests]
    end
    
    subgraph "Test Coverage"
        Packages[Package Tests]
        API[API Tests]
        UI[UI Component Tests]
        Workflow[User Workflow Tests]
    end
    
    Unit --> Packages
    Integration --> API
    E2E --> Workflow
    Visual --> UI
```

### Deployment

- **Vercel**: Frontend and API deployment
- **Google Cloud Run**: Worker deployment
- **Environment Promotion**: Staging → Production
- **Feature Flags**: Gradual feature rollouts

## Glossary

| Term | Definition |
|------|------------|
| **Render** | AI-generated landscape visualization |
| **Asset Instance** | Plant or material placed in design |
| **Design Canvas** | Interactive design workspace |
| **Quality Score** | AI-generated quality assessment (0-1) |
| **Credit Cost** | Billing units for operations |
| **Subscription Tier** | User plan level (starter/pro/growth) |
| **Perceptual Hash** | Image similarity detection hash |
| **Review Queue** | Manual quality review system |

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo Structure
**Decision**: Use npm workspaces with Turbo for monorepo management
**Rationale**: Shared code reuse, consistent tooling, simplified dependency management

### ADR-002: tRPC for API Layer
**Decision**: Use tRPC instead of REST or GraphQL
**Rationale**: Type safety, reduced boilerplate, excellent TypeScript integration

### ADR-003: BullMQ for Job Processing
**Decision**: Use BullMQ for background job processing
**Rationale**: Redis-backed reliability, built-in retry logic, excellent monitoring

### ADR-004: Service-Oriented Refactoring
**Decision**: Break large files into focused service classes
**Rationale**: Improved maintainability, testability, and single responsibility principle

---

*This architecture documentation is maintained as a living document and updated with significant system changes.*