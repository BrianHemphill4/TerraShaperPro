# Storage Endpoints

Manage file uploads and storage for projects.

## storage.upload

Upload files to project storage.

### Request
```typescript
{
  projectId: string;
  file: {
    name: string;
    type: string;               // MIME type
    size: number;               // Bytes
    data: string;               // Base64 encoded
  };
  folder?: string;              // Optional folder path
  metadata?: {
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  };
}
```

### Response
```typescript
{
  fileId: string;
  url: string;
  thumbnailUrl?: string;        // For images
  size: number;
  type: string;
  uploadedAt: string;
  expiresAt?: string;          // For temporary URLs
}
```

### Example
```bash
curl -X POST https://api.terrashaperpro.com/trpc/storage.upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "projectId": "proj_abc123",
      "file": {
        "name": "site-photo.jpg",
        "type": "image/jpeg",
        "size": 245760,
        "data": "base64_encoded_image_data..."
      },
      "folder": "site-photos",
      "metadata": {
        "description": "Front yard before renovation",
        "tags": ["before", "front-yard"]
      }
    }
  }'
```

## storage.uploadUrl

Get a signed URL for direct file upload (recommended for large files).

### Request
```typescript
{
  projectId: string;
  filename: string;
  contentType: string;
  size: number;                 // File size in bytes
  folder?: string;
}
```

### Response
```typescript
{
  uploadUrl: string;            // Signed upload URL
  fileId: string;               // File ID for reference
  fields: Record<string, string>; // Additional fields for upload
  expiresAt: string;            // URL expiration
  maxSize: number;              // Maximum allowed size
}
```

### Example Upload Flow
```javascript
// 1. Get signed URL
const { uploadUrl, fields } = await client.storage.uploadUrl.mutate({
  projectId: 'proj_abc123',
  filename: 'large-plan.pdf',
  contentType: 'application/pdf',
  size: 10485760 // 10MB
});

// 2. Upload file directly
const formData = new FormData();
Object.entries(fields).forEach(([key, value]) => {
  formData.append(key, value);
});
formData.append('file', fileBlob);

await fetch(uploadUrl, {
  method: 'POST',
  body: formData
});
```

## storage.list

List files in project storage.

### Request
```typescript
{
  projectId: string;
  folder?: string;              // Filter by folder
  type?: string[];              // Filter by MIME types
  tags?: string[];              // Filter by tags
  search?: string;              // Search in filename/description
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
}
```

### Response
```typescript
{
  files: Array<{
    fileId: string;
    name: string;
    path: string;
    url: string;
    thumbnailUrl?: string;
    type: string;
    size: number;
    metadata?: {
      description?: string;
      tags?: string[];
      dimensions?: {
        width: number;
        height: number;
      };
    };
    uploadedBy: {
      id: string;
      name: string;
    };
    uploadedAt: string;
    lastModified: string;
  }>;
  folders: string[];            // Subfolder list
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  usage: {
    totalSize: number;          // Total storage used
    fileCount: number;
    limit: number;              // Storage limit
  };
}
```

## storage.get

Get file details and download URL.

### Request
```typescript
{
  fileId: string;
}
```

### Response
```typescript
{
  fileId: string;
  name: string;
  path: string;
  url: string;
  downloadUrl: string;          // Direct download URL
  thumbnailUrl?: string;
  type: string;
  size: number;
  metadata?: {
    description?: string;
    tags?: string[];
    dimensions?: {
      width: number;
      height: number;
    };
    exif?: Record<string, any>; // For images
  };
  versions?: Array<{           // Different sizes for images
    name: string;
    url: string;
    width: number;
    height: number;
  }>;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  lastModified: string;
  accessCount: number;
}
```

## storage.delete

Delete a file from storage.

### Request
```typescript
{
  fileId: string;
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
  freedSpace: number;           // Bytes freed
}
```

## storage.move

Move or rename a file.

### Request
```typescript
{
  fileId: string;
  newPath?: string;             // New folder path
  newName?: string;             // New filename
}
```

### Response
```typescript
{
  fileId: string;
  oldPath: string;
  newPath: string;
  url: string;
}
```

## storage.copy

Copy a file to another location.

### Request
```typescript
{
  fileId: string;
  targetProjectId: string;      // Can copy to another project
  targetFolder?: string;
  newName?: string;
}
```

### Response
```typescript
{
  fileId: string;               // New file ID
  name: string;
  path: string;
  url: string;
  copiedAt: string;
}
```

## storage.createFolder

Create a new folder in project storage.

### Request
```typescript
{
  projectId: string;
  path: string;                 // Folder path
  metadata?: {
    description?: string;
    color?: string;             // Folder color in UI
  };
}
```

### Response
```typescript
{
  path: string;
  created: boolean;
  metadata?: Record<string, any>;
}
```

## File Type Restrictions

### Allowed Image Types
- JPEG/JPG: `image/jpeg`
- PNG: `image/png`
- WebP: `image/webp`
- SVG: `image/svg+xml`

### Allowed Document Types
- PDF: `application/pdf`
- DWG: `application/dwg`
- DXF: `application/dxf`

### Allowed Data Types
- JSON: `application/json`
- CSV: `text/csv`
- XML: `application/xml`

### Size Limits
- Images: 10MB per file
- Documents: 50MB per file
- Data files: 5MB per file
- Total project storage: Varies by plan

## Error Responses

### 413 Payload Too Large
```json
{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "File size exceeds limit of 10MB"
  }
}
```

### 415 Unsupported Media Type
```json
{
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "File type 'application/exe' is not allowed"
  }
}
```

### 507 Insufficient Storage
```json
{
  "error": {
    "code": "INSUFFICIENT_STORAGE",
    "message": "Storage limit exceeded. Used: 4.8GB, Limit: 5GB"
  }
}
```