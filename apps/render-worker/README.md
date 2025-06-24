# Render Worker

Background job processor that handles AI-powered landscape rendering using Google Imagen and OpenAI.

## Purpose

- **Job Processing**: Consumes render jobs from Redis queue via BullMQ
- **AI Integration**: Orchestrates AI providers (Google Imagen, OpenAI DALL-E) for image generation
- **Quality Assurance**: Automated quality checks using perceptual hashing and failure detection
- **Storage Management**: Processes and stores render outputs in Google Cloud Storage
- **Progress Tracking**: Real-time progress updates and error handling

## Architecture

- **Queue System**: BullMQ worker consuming from Redis
- **AI Providers**: Abstracted provider system supporting multiple AI services
- **Quality Control**: pHash comparison and automated quality validation
- **Storage**: Google Cloud Storage integration with CDN optimization
- **Monitoring**: Comprehensive error tracking and performance metrics

## Key Features

- Sub-60-second 4K landscape renders
- Provider failover between Google Imagen and OpenAI
- Automatic quality validation and retry logic
- Credit consumption tracking with failure refunds
- Real-time progress reporting via server-sent events
- Comprehensive error handling and alerting

## Job Processing Flow

1. **Job Consumption**: Dequeue render jobs from Redis
2. **Prompt Generation**: Convert design annotations to AI prompts
3. **AI Rendering**: Submit to Google Imagen or OpenAI with retries
4. **Quality Check**: Validate output using pHash and failure detection
5. **Storage**: Process and store images in Google Cloud Storage
6. **Completion**: Update database and notify client via SSE

## Development

```bash
# Install dependencies
npm install

# Start worker (requires Redis running)
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint and format
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `REDIS_URL` - Queue connection
- `DATABASE_URL` - PostgreSQL for job tracking
- `GOOGLE_CLOUD_CREDENTIALS` - AI and storage access
- `OPENAI_API_KEY` - OpenAI DALL-E access
- `SENTRY_DSN` - Error tracking

## Dependencies

- `@terrashaper/ai-service` - AI provider abstraction
- `@terrashaper/queue` - Job queue management
- `@terrashaper/storage` - Cloud storage operations
- `@terrashaper/shared` - Common utilities and types