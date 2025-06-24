# Storage Package

Google Cloud Storage integration providing file uploads, signed URLs, image processing, and CDN optimization.

## Purpose

- **Cloud Storage**: Centralized Google Cloud Storage operations
- **Image Processing**: Sharp-based image optimization, resizing, and format conversion
- **Security**: Signed URL generation for secure file access
- **Performance**: CDN integration and image optimization
- **Metadata**: EXIF data stripping and file validation

## Core Components

### StorageService
Main service class providing high-level storage operations:

```typescript
import { StorageService } from '@terrashaper/storage'

const storage = new StorageService()

// Upload with processing
const result = await storage.uploadImage(file, {
  resize: { width: 1024, height: 1024 },
  format: 'webp',
  quality: 85
})

// Generate signed URLs
const url = await storage.getSignedUrl('projects/design-123.jpg', {
  action: 'read',
  expires: Date.now() + 3600000 // 1 hour
})
```

### ImageProcessor
Specialized image processing utilities:

```typescript
import { ImageProcessor } from '@terrashaper/storage'

const processor = new ImageProcessor()

// Generate thumbnails
const thumbnail = await processor.generateThumbnail(buffer, {
  width: 200,
  height: 200,
  format: 'webp'
})

// Extract dominant colors
const colors = await processor.extractDominantColors(buffer)
```

### RenderStorage
Specialized storage for AI-generated renders:

```typescript
import { RenderStorage } from '@terrashaper/storage'

const renderStorage = new RenderStorage()

// Store render with metadata
await renderStorage.storeRender(imageBuffer, {
  projectId: 'proj_123',
  userId: 'user_456',
  prompt: 'Modern landscape design...',
  provider: 'google-imagen'
})
```

## Key Features

- **Multi-Format Support**: JPEG, PNG, WebP, AVIF optimization
- **Automatic Thumbnails**: Generate multiple sizes for responsive images
- **EXIF Stripping**: Remove sensitive metadata from uploaded images  
- **CDN Integration**: Optimized delivery through Google Cloud CDN
- **Security**: Signed URLs with configurable expiration
- **Batch Operations**: Efficient multi-file processing
- **Error Handling**: Comprehensive error recovery and retry logic

## Configuration

```typescript
// Environment variables
GOOGLE_CLOUD_PROJECT_ID=your-project
GOOGLE_CLOUD_BUCKET_NAME=terrashaper-storage
GOOGLE_CLOUD_CREDENTIALS=base64-encoded-credentials

// Storage config
const config = {
  buckets: {
    renders: 'terrashaper-renders',
    uploads: 'terrashaper-uploads',
    plants: 'terrashaper-plants'
  },
  cdn: {
    domain: 'cdn.terrashaper.com',
    ttl: 86400 // 24 hours
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Test connection
node test-connection.js

# Run tests
npm run test

# Type check
npm run typecheck
```

## Dependencies

- **@google-cloud/storage**: Cloud storage SDK
- **Sharp**: High-performance image processing
- **Multer**: File upload handling
- **MIME Types**: File type detection