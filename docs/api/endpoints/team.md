# Team Endpoints

Manage team members and permissions.

## team.members

List all team members in the organization.

### Request
```typescript
{
  role?: ('owner' | 'admin' | 'designer' | 'viewer')[];
  status?: ('active' | 'invited' | 'suspended')[];
  search?: string;              // Search by name or email
  page?: number;
  limit?: number;
}
```

### Response
```typescript
{
  members: Array<{
    id: string;
    userId: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'designer' | 'viewer';
    status: 'active' | 'invited' | 'suspended';
    permissions: string[];
    joinedAt: string;
    lastActiveAt?: string;
    invitedBy?: {
      id: string;
      name: string;
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
curl -X POST https://api.terrashaperpro.com/trpc/team.members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"json": {"role": ["designer", "admin"]}}'
```

## team.invite

Invite a new team member.

### Request
```typescript
{
  email: string;                // Required
  role: 'admin' | 'designer' | 'viewer';
  message?: string;             // Custom invitation message
  projects?: string[];          // Specific project access
}
```

### Response
```typescript
{
  invitationId: string;
  email: string;
  role: string;
  status: 'sent' | 'pending';
  expiresAt: string;
  inviteUrl: string;
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/team.invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "email": "designer@example.com",
      "role": "designer",
      "message": "Welcome to our landscape design team!"
    }
  }'
```

## team.updateRole

Update a team member's role.

### Request
```typescript
{
  memberId: string;
  role: 'admin' | 'designer' | 'viewer';
}
```

### Response
```typescript
{
  id: string;
  userId: string;
  role: string;
  updatedAt: string;
}
```

## team.remove

Remove a team member from the organization.

### Request
```typescript
{
  memberId: string;
  transferProjectsTo?: string;  // User ID to transfer projects
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
  projectsTransferred?: number;
}
```

## team.suspend

Temporarily suspend a team member's access.

### Request
```typescript
{
  memberId: string;
  reason?: string;
}
```

### Response
```typescript
{
  id: string;
  status: 'suspended';
  suspendedAt: string;
}
```

## team.reactivate

Reactivate a suspended team member.

### Request
```typescript
{
  memberId: string;
}
```

### Response
```typescript
{
  id: string;
  status: 'active';
  reactivatedAt: string;
}
```

## team.activity

Get team activity logs.

### Request
```typescript
{
  memberId?: string;            // Filter by member
  actionType?: string[];        // e.g., ['project.create', 'render.complete']
  dateRange?: {
    start: string;
    end: string;
  };
  page?: number;
  limit?: number;
}
```

### Response
```typescript
{
  activities: Array<{
    id: string;
    userId: string;
    userName: string;
    action: string;
    resource: {
      type: string;
      id: string;
      name: string;
    };
    details?: Record<string, any>;
    timestamp: string;
    ip?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Responses

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Only owners and admins can manage team members"
  }
}
```

### 409 Conflict
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "User is already a team member"
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Cannot remove the last owner"
  }
}
```