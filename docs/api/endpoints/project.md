# Project Endpoints

Manage landscape design projects.

## project.list

List all projects for the authenticated user's organization.

### Request
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  search?: string;    // Search by name
  status?: 'draft' | 'active' | 'completed' | 'archived';
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

### Response
```typescript
{
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    coverImage?: string;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: string;
      name: string;
      email: string;
    };
    stats: {
      plantCount: number;
      renderCount: number;
      collaborators: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/project.list \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "page": 1,
      "limit": 10,
      "status": "active",
      "sortBy": "updatedAt",
      "sortOrder": "desc"
    }
  }'
```

## project.get

Get detailed information about a specific project.

### Request
```typescript
{
  id: string;  // Project ID
}
```

### Response
```typescript
{
  id: string;
  name: string;
  description?: string;
  status: string;
  coverImage?: string;
  canvas: {
    width: number;
    height: number;
    scale: number;
    unit: 'ft' | 'm';
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  client?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
  stats: {
    plantCount: number;
    renderCount: number;
    totalArea: number;
    lastActivity: string;
  };
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/project.get \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"id": "proj_abc123"}}'
```

## project.create

Create a new project.

### Request
```typescript
{
  name: string;           // Required, 1-100 characters
  description?: string;   // Optional, max 500 characters
  canvas?: {
    width?: number;       // Default: 1000
    height?: number;      // Default: 800
    scale?: number;       // Default: 1
    unit?: 'ft' | 'm';   // Default: 'ft'
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  client?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  template?: string;      // Template ID to use
}
```

### Response
```typescript
{
  id: string;
  name: string;
  // ... same as project.get response
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/project.create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "name": "Smith Residence Front Yard",
      "description": "Complete front yard renovation with native plants",
      "canvas": {
        "width": 1200,
        "height": 900,
        "scale": 10,
        "unit": "ft"
      },
      "location": {
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701"
      }
    }
  }'
```

## project.update

Update an existing project.

### Request
```typescript
{
  id: string;             // Required
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  canvas?: {
    width?: number;
    height?: number;
    scale?: number;
    unit?: 'ft' | 'm';
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  client?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}
```

### Response
```typescript
{
  id: string;
  // ... updated project data
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/project.update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "id": "proj_abc123",
      "status": "completed",
      "description": "Front yard renovation completed successfully"
    }
  }'
```

## project.delete

Delete a project permanently.

### Request
```typescript
{
  id: string;  // Project ID
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/project.delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"id": "proj_abc123"}}'
```

## project.duplicate

Create a copy of an existing project.

### Request
```typescript
{
  id: string;        // Source project ID
  name: string;      // Name for the duplicate
  includeRenders?: boolean;  // Copy renders (default: false)
}
```

### Response
```typescript
{
  id: string;        // New project ID
  // ... same as project.get response
}
```

## project.export

Export project data in various formats.

### Request
```typescript
{
  id: string;
  format: 'json' | 'pdf' | 'dwg';
  options?: {
    includeRenders?: boolean;
    includeComments?: boolean;
    includeHistory?: boolean;
  };
}
```

### Response
```typescript
{
  exportUrl: string;      // Temporary download URL
  expiresAt: string;      // URL expiration time
  format: string;
  size: number;           // File size in bytes
}
```

## Error Responses

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this project"
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid project data",
    "data": {
      "zodError": {
        "name": ["String must contain at least 1 character(s)"]
      }
    }
  }
}
```