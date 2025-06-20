# TerraShaper Pro SDK

Official JavaScript/TypeScript SDK for TerraShaper Pro API.

## Installation

```bash
npm install @terrashaper/sdk
# or
yarn add @terrashaper/sdk
# or
pnpm add @terrashaper/sdk
```

## Quick Start

```typescript
import { TerraShaper } from '@terrashaper/sdk';

// Initialize the client
const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  environment: 'production' // or 'development'
});

// Create a project
const project = await client.projects.create({
  name: 'My Landscape Design',
  description: 'Front yard renovation'
});

// Search for plants
const plants = await client.plants.search({
  query: 'oak',
  filters: {
    usdaZones: ['8b', '9a'],
    sunRequirements: ['full_sun']
  }
});

// Create a render
const render = await client.renders.create({
  projectId: project.id,
  settings: {
    resolution: '1920x1080',
    quality: 85
  }
});
```

## Configuration

### Authentication

```typescript
// API Key authentication (recommended)
const client = new TerraShaper({
  apiKey: process.env.TERRASHAPER_API_KEY
});

// JWT authentication (for browser apps)
const client = new TerraShaper({
  authToken: async () => {
    const token = await getAuthToken(); // Your auth logic
    return token;
  }
});
```

### Options

```typescript
const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  
  // Optional configuration
  environment: 'production',     // 'production' | 'development' | 'custom'
  apiUrl: 'https://custom.api',  // For custom environments
  timeout: 30000,                // Request timeout in ms
  maxRetries: 3,                 // Retry failed requests
  
  // Hooks
  onRequest: (config) => {
    console.log('Request:', config);
    return config;
  },
  onResponse: (response) => {
    console.log('Response:', response);
    return response;
  },
  onError: (error) => {
    console.error('Error:', error);
    throw error;
  }
});
```

## Resources

### Projects

```typescript
// List projects
const { projects, pagination } = await client.projects.list({
  page: 1,
  limit: 20,
  status: 'active'
});

// Get a project
const project = await client.projects.get('proj_abc123');

// Create a project
const newProject = await client.projects.create({
  name: 'Garden Design',
  canvas: {
    width: 1000,
    height: 800,
    unit: 'ft'
  }
});

// Update a project
const updated = await client.projects.update('proj_abc123', {
  status: 'completed'
});

// Delete a project
await client.projects.delete('proj_abc123');

// Duplicate a project
const duplicate = await client.projects.duplicate('proj_abc123', {
  name: 'Garden Design Copy'
});

// Export a project
const exportData = await client.projects.export('proj_abc123', {
  format: 'pdf',
  options: {
    includeRenders: true
  }
});
```

### Plants

```typescript
// Search plants
const results = await client.plants.search({
  query: 'native grass',
  filters: {
    usdaZones: ['9a'],
    waterRequirements: ['low'],
    matureHeight: { max: 3 }
  },
  limit: 50
});

// Get plant details
const plant = await client.plants.get('plant_abc123');

// Get categories
const categories = await client.plants.categories();

// Manage favorites
await client.plants.favorites.add('plant_abc123');
await client.plants.favorites.remove('plant_abc123');
const favorites = await client.plants.favorites.list();

// AI recommendations
const recommendations = await client.plants.recommend({
  conditions: {
    usdaZone: '9a',
    sunExposure: 'full_sun',
    soilType: 'clay',
    moisture: 'medium',
    space: { width: 10, height: 15 }
  },
  preferences: {
    nativeOnly: true,
    lowMaintenance: true
  }
});
```

### Renders

```typescript
// Create a render
const render = await client.renders.create({
  projectId: 'proj_abc123',
  annotations: [...],
  settings: {
    resolution: '2048x1536',
    quality: 90,
    style: 'realistic',
    timeOfDay: 'afternoon'
  }
});

// Check render status
const status = await client.renders.status('rnd_xyz789');

// Wait for completion
const completed = await client.renders.waitForCompletion('rnd_xyz789', {
  pollingInterval: 2000,
  timeout: 300000
});

// List renders
const { renders } = await client.renders.list({
  projectId: 'proj_abc123',
  status: ['completed']
});

// Download render
const download = await client.renders.download('rnd_xyz789');
const buffer = await download.arrayBuffer();

// Retry failed render
const retry = await client.renders.retry('rnd_xyz789');

// Submit feedback
await client.renders.feedback('rnd_xyz789', {
  rating: 5,
  feedback: {
    comments: 'Excellent quality!'
  }
});
```

### Teams

```typescript
// List team members
const { members } = await client.teams.members({
  role: ['designer', 'admin']
});

// Invite team member
const invitation = await client.teams.invite({
  email: 'designer@example.com',
  role: 'designer',
  message: 'Welcome to the team!'
});

// Update member role
await client.teams.updateRole('member_123', {
  role: 'admin'
});

// Remove member
await client.teams.remove('member_123');

// Get activity logs
const { activities } = await client.teams.activity({
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  }
});
```

### Storage

```typescript
// Upload file
const upload = await client.storage.upload({
  projectId: 'proj_abc123',
  file: fileBlob,
  metadata: {
    description: 'Site photo',
    tags: ['before', 'front-yard']
  }
});

// Upload large file with progress
const largeUpload = await client.storage.uploadLarge({
  projectId: 'proj_abc123',
  file: largeFile,
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress.percent}%`);
  }
});

// List files
const { files } = await client.storage.list({
  projectId: 'proj_abc123',
  type: ['image/jpeg', 'image/png']
});

// Download file
const file = await client.storage.get('file_abc123');
const blob = await client.storage.download('file_abc123');

// Delete file
await client.storage.delete('file_abc123');
```

## Utilities

### Batch Operations

```typescript
// Batch multiple requests
const results = await client.batch([
  client.projects.get('proj_1'),
  client.projects.get('proj_2'),
  client.plants.search({ query: 'tree' })
]);

// Parallel operations with concurrency control
const projects = ['proj_1', 'proj_2', 'proj_3'];
const renders = await client.parallel(
  projects.map(id => () => client.renders.create({
    projectId: id,
    settings: { resolution: '1920x1080' }
  })),
  { concurrency: 2 }
);
```

### Error Handling

```typescript
import { TerraShaper, TerraShapeError } from '@terrashaper/sdk';

try {
  const project = await client.projects.get('invalid_id');
} catch (error) {
  if (error instanceof TerraShapeError) {
    console.error(`Error ${error.code}: ${error.message}`);
    
    switch (error.code) {
      case 'NOT_FOUND':
        // Handle not found
        break;
      case 'RATE_LIMITED':
        // Wait and retry
        await new Promise(r => setTimeout(r, error.retryAfter));
        break;
      case 'VALIDATION_ERROR':
        // Check error.details for field errors
        console.error(error.details);
        break;
    }
  }
}
```

### Pagination

```typescript
// Manual pagination
let page = 1;
let hasMore = true;

while (hasMore) {
  const { projects, pagination } = await client.projects.list({
    page,
    limit: 50
  });
  
  // Process projects
  processProjects(projects);
  
  hasMore = page < pagination.totalPages;
  page++;
}

// Auto-pagination helper
const allProjects = await client.projects.listAll({
  status: 'active'
});

// Async iterator
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}
```

### Webhooks

```typescript
// Verify webhook signature
import { verifyWebhook } from '@terrashaper/sdk';

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-terrashaper-signature'];
  const isValid = verifyWebhook(
    req.body,
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const event = JSON.parse(req.body);
  handleWebhook(event);
  
  res.status(200).send('OK');
});
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  Project,
  Plant,
  Render,
  CreateProjectInput,
  PlantSearchFilters,
  RenderSettings
} from '@terrashaper/sdk';

// Type-safe operations
const createProject = async (
  input: CreateProjectInput
): Promise<Project> => {
  return await client.projects.create(input);
};

// Autocomplete for all options
const filters: PlantSearchFilters = {
  usdaZones: ['9a'], // Type-safe enum values
  sunRequirements: ['full_sun'],
  waterRequirements: ['low']
};
```

## Advanced Usage

### Custom Interceptors

```typescript
// Add request interceptor
client.interceptors.request.use((config) => {
  config.headers['X-Custom-Header'] = 'value';
  return config;
});

// Add response interceptor
client.interceptors.response.use(
  (response) => {
    console.log('Success:', response);
    return response;
  },
  (error) => {
    if (error.code === 'UNAUTHORIZED') {
      // Refresh token logic
    }
    throw error;
  }
);
```

### Caching

```typescript
import { TerraShaper, MemoryCache } from '@terrashaper/sdk';

const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  cache: new MemoryCache({
    ttl: 300000, // 5 minutes
    max: 100     // Max entries
  })
});

// Or use custom cache
class RedisCache {
  async get(key: string) { /* ... */ }
  async set(key: string, value: any, ttl?: number) { /* ... */ }
  async delete(key: string) { /* ... */ }
  async clear() { /* ... */ }
}

const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  cache: new RedisCache()
});
```

### Logging

```typescript
const client = new TerraShaper({
  apiKey: 'YOUR_API_KEY',
  logger: {
    debug: (message, meta) => console.debug(message, meta),
    info: (message, meta) => console.info(message, meta),
    warn: (message, meta) => console.warn(message, meta),
    error: (message, meta) => console.error(message, meta)
  }
});
```

## Examples

### Complete Project Workflow

```typescript
async function createLandscapeDesign() {
  // 1. Create project
  const project = await client.projects.create({
    name: 'Modern Garden Design',
    location: {
      city: 'Austin',
      state: 'TX',
      zipCode: '78701'
    }
  });

  // 2. Search and add plants
  const { plants } = await client.plants.search({
    filters: {
      usdaZones: ['8b', '9a'],
      nativeStatus: ['native'],
      waterRequirements: ['low']
    }
  });

  // 3. Create design annotations
  const annotations = plants.slice(0, 10).map((plant, index) => ({
    type: 'assetInstance',
    data: {
      id: `plant-${index}`,
      category: plant.category,
      name: plant.name,
      position: { x: index * 100, y: 200 },
      size: { width: 80, height: 100 }
    }
  }));

  // 4. Generate render
  const render = await client.renders.create({
    projectId: project.id,
    annotations,
    settings: {
      resolution: '1920x1080',
      quality: 85,
      style: 'realistic'
    }
  });

  // 5. Wait for completion
  const completed = await client.renders.waitForCompletion(render.renderId);
  
  // 6. Share with client
  const share = await client.projects.share(project.id, {
    email: 'client@example.com',
    permission: 'viewer',
    message: 'Please review the design'
  });

  return {
    project,
    render: completed,
    shareLink: share.url
  };
}
```

## Support

- **Documentation**: [docs.terrashaperpro.com](https://docs.terrashaperpro.com)
- **API Reference**: [api.terrashaperpro.com/docs](https://api.terrashaperpro.com/docs)
- **GitHub**: [github.com/terrashaper/sdk-js](https://github.com/terrashaper/sdk-js)
- **npm**: [npmjs.com/package/@terrashaper/sdk](https://npmjs.com/package/@terrashaper/sdk)

For issues and feature requests, please use the GitHub issue tracker.