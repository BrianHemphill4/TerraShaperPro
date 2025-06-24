# AI Service Package

Provider-agnostic abstraction layer for AI image generation with adapters for Google Imagen and OpenAI DALL-E.

## Purpose

- **Provider Abstraction**: Unified interface for multiple AI image generation services
- **Prompt Engineering**: Advanced prompt generation from design annotations
- **Quality Assurance**: Automated quality validation using perceptual hashing
- **Failover Support**: Automatic provider switching for reliability
- **Performance Optimization**: Caching and retry mechanisms

## Core Components

### AI Provider Interface
Standardized interface for all AI providers:

```typescript
interface AIProvider {
  generateImage(params: GenerationParams): Promise<GenerationResult>
  validateConfig(): Promise<boolean>
  getProviderInfo(): ProviderInfo
}
```

### Provider Implementations

#### Google Imagen Provider
```typescript
import { GoogleImagenProvider } from '@terrashaper/ai-service'

const provider = new GoogleImagenProvider({
  projectId: 'your-gcp-project',
  credentials: googleCredentials
})

const result = await provider.generateImage({
  prompt: 'Modern Texas landscape with native plants',
  aspectRatio: '16:9',
  quality: 'high',
  stylePreset: 'photographic'
})
```

#### OpenAI DALL-E Provider
```typescript
import { OpenAIProvider } from '@terrashaper/ai-service'

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY
})

const result = await provider.generateImage({
  prompt: 'Texas xeriscape garden design',
  size: '1024x1024',
  quality: 'hd',
  style: 'natural'
})
```

### Provider Manager
Handles provider selection and failover:

```typescript
import { ProviderManager } from '@terrashaper/ai-service'

const manager = new ProviderManager({
  providers: [googleProvider, openaiProvider],
  strategy: 'failover', // or 'load-balance'
  retryAttempts: 3
})

// Automatically selects best available provider
const result = await manager.generateImage(params)
```

## Prompt Generation System

### Template Engine
Converts design annotations to optimized prompts:

```typescript
import { PromptGenerator } from '@terrashaper/ai-service'

const generator = new PromptGenerator()

const prompt = await generator.generatePrompt({
  annotations: [
    { type: 'plant', species: 'Texas Sage', position: [100, 200] },
    { type: 'area', material: 'decomposed_granite', bounds: [...] }
  ],
  style: {
    season: 'spring',
    lighting: 'golden_hour',
    perspective: 'aerial'
  },
  quality: {
    resolution: '4k',
    photoRealism: 'high'
  }
})
```

### Style Modifiers
Apply consistent styling across renders:

```typescript
import { StyleModifier } from '@terrashaper/ai-service'

const modifier = new StyleModifier()

const styledPrompt = modifier.applyStyle(basePrompt, {
  season: 'fall',
  weather: 'partly_cloudy',
  timeOfDay: 'morning',
  perspective: 'eye_level'
})
```

## Quality Assurance

### Perceptual Hash Comparison
```typescript
import { QualityChecker } from '@terrashaper/ai-service'

const checker = new QualityChecker()

const isValid = await checker.validateImage(imageBuffer, {
  minQuality: 0.8,
  checkDuplicates: true,
  validateContent: true
})
```

### Failure Detection
```typescript
import { FailureDetectionService } from '@terrashaper/ai-service'

const detector = new FailureDetectionService()

const analysis = await detector.analyzeImage(imageBuffer)
// Returns: corruption, artifacts, inappropriate content, etc.
```

## Configuration

```typescript
const aiConfig = {
  providers: {
    google: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID
    }
  },
  generation: {
    defaultQuality: 'high',
    maxRetries: 3,
    timeout: 60000,
    cacheResults: true
  },
  quality: {
    minPHashThreshold: 0.8,
    enableContentValidation: true,
    maxSimilarityScore: 0.95
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm run test

# Type check
npm run typecheck
```

## Environment Variables

```bash
# Google Imagen
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_CREDENTIALS=base64-credentials

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Quality settings
AI_QUALITY_THRESHOLD=0.8
AI_MAX_RETRIES=3
```

## Dependencies

- **Google Cloud AI Platform**: Imagen access
- **OpenAI SDK**: DALL-E integration  
- **Sharp**: Image processing
- **pHash**: Perceptual hashing
- **Axios**: HTTP client for API calls