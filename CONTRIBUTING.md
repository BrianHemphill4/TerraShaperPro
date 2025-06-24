# Contributing to TerraShaper Pro

Welcome to TerraShaper Pro! This guide will help you get started contributing to our landscape design platform. Whether you're fixing bugs, adding features, or improving documentation, we appreciate your help.

## Quick Start for Contributors

### 1. Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/terrashaper-pro.git
cd terrashaper-pro

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/web/.env.example apps/web/.env
cp apps/api-gateway/.env.example apps/api-gateway/.env
cp apps/render-worker/.env.example apps/render-worker/.env

# Start development servers
npm run dev
```

### 2. Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Run tests and linting
npm run test
npm run lint

# Commit your changes
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

## Code Style & Standards

### TypeScript Guidelines
- **Language**: TypeScript (Node 20) for all new code
- **Style**: Prettier defaults with 2-space indentation, single quotes, semicolons
- **Features**: Use ES2022 features; avoid experimental proposals
- **Types**: Explicit return types for all functions; no `any` except in third-party typings
- **Validation**: Validate external input; never trust user-supplied paths or keys

```typescript
// ✅ Good
interface UserData {
  id: string;
  name: string;
  email: string;
}

async function createUser(data: UserData): Promise<User> {
  // implementation
}

// ❌ Avoid
function createUser(data: any) {
  // implementation
}
```

### Code Formatting
- **Prettier**: Automatic formatting with 2-space indentation, single quotes, semicolons
- **ESLint**: Custom configuration with TypeScript rules
- **Import sorting**: Use `simple-import-sort` for consistent imports

```typescript
// ✅ Good import order
import React from 'react'
import { NextPage } from 'next'

import { Button } from '@/components/ui/button'
import { api } from '@/lib/trpc'

import type { ProjectData } from './types'
```

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ProjectData`)

## Architecture Guidelines

### Package Structure
Follow the established monorepo pattern:

```
packages/
├── shared/           # Common utilities and types
├── ai-service/      # AI provider abstractions
├── db/              # Database utilities and types
└── queue/           # Job queue management

apps/
├── web/             # Next.js frontend
├── api-gateway/     # tRPC API server
└── render-worker/   # Background processing
```

### Service-Oriented Design
When creating new features, follow the service-oriented pattern established in the render-worker refactoring:

```typescript
// ✅ Good: Focused service class
export class CreditService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async consumeCredits(/* parameters */): Promise<boolean> {
    // Single responsibility: credit operations
  }
}

// ❌ Avoid: Large, multi-purpose files
export function processEverything(/* many parameters */) {
  // 400+ lines handling multiple concerns
}
```

### Error Handling
- **Consistent error types**: Use custom error classes
- **Graceful degradation**: Handle failures without crashing
- **Logging**: Use structured logging with context

```typescript
// ✅ Good error handling
try {
  const result = await aiService.generateImage(prompt);
  return { success: true, data: result };
} catch (error) {
  logger.error('Image generation failed', {
    prompt: prompt.id,
    error: error.message,
    userId,
  });
  
  if (error instanceof InsufficientCreditsError) {
    return { success: false, error: 'INSUFFICIENT_CREDITS' };
  }
  
  throw error; // Re-throw unexpected errors
}
```

## Testing Standards

### Test Structure
- **Unit tests**: Test individual functions and components
- **Integration tests**: Test API endpoints and service interactions
- **E2E tests**: Test complete user workflows with Playwright

### Test Organization
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
└── api/
    └── __tests__/
        └── integration/
            └── projects.test.ts
```

### Writing Good Tests
```typescript
// ✅ Good test structure
describe('CreditService', () => {
  let creditService: CreditService;
  
  beforeEach(() => {
    creditService = new CreditService(mockSupabaseUrl, mockKey);
  });

  describe('consumeCredits', () => {
    it('should consume credits for valid render request', async () => {
      // Arrange
      const mockSettings = { resolution: '1024x1024', quality: 75 };
      
      // Act
      const result = await creditService.consumeCredits(
        'org-id',
        'user-id', 
        'render-id',
        mockSettings
      );
      
      // Assert
      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('consume_credits', {
        p_organization_id: 'org-id',
        p_amount: 2, // Expected credit cost
      });
    });

    it('should throw error when insufficient credits', async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({ data: null, error: 'Insufficient credits' });
      
      // Act & Assert
      await expect(creditService.consumeCredits(/* params */)).rejects.toThrow(
        'Insufficient credits'
      );
    });
  });
});
```

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, consistent commit messages:

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring (no functionality change)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, tool configuration changes

### Examples
```bash
# Features
feat(render): add quality score validation
feat(api): implement team collaboration endpoints

# Bug fixes
fix(auth): resolve token refresh loop
fix(canvas): prevent memory leak in drawing tools

# Refactoring
refactor(render-worker): decompose processor into services
refactor(ui): extract reusable form components

# Documentation
docs: add architecture diagrams
docs(api): update endpoint documentation
```

### Scope Guidelines
- **render**: Rendering and AI services
- **auth**: Authentication and authorization
- **api**: API gateway and endpoints
- **ui**: User interface components
- **db**: Database and data layer
- **queue**: Background job processing

## Pull Request Process

### Before Submitting
1. **Run the full test suite**: `npm run test`
2. **Check TypeScript**: `npm run type-check`
3. **Lint your code**: `npm run lint`
4. **Update documentation** if you changed APIs
5. **Add tests** for new functionality

### PR Template
When creating a pull request, include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or marked as breaking)
```

### Review Process
1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer review required
3. **Testing**: Reviewers may test your changes locally
4. **Documentation**: Ensure docs are updated for new features

## Local Development Setup

### Prerequisites
- **Node.js**: Version 20.x (use nvm or asdf)
- **npm**: Latest stable version
- **Docker**: For Redis and local services
- **Git**: For version control

### Required Tools
- **VS Code**: Recommended editor with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### VS Code Settings
Add to your workspace settings:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Debugging
- **Frontend**: Use React Developer Tools and browser debugging
- **API**: Use VS Code debugger with Node.js configuration
- **Worker**: Use console logging and Sentry error tracking

## Package-Specific Guidelines

### Frontend (apps/web)
- **Components**: Create reusable components in `src/components/ui/`
- **Pages**: Use Next.js App Router conventions
- **Styling**: Use Tailwind CSS with component variants
- **State**: Use React hooks and context, avoid global state when possible

### API Gateway (apps/api-gateway)
- **Routers**: Organize endpoints by domain (projects, renders, etc.)
- **Middleware**: Add reusable middleware for auth, validation, etc.
- **Validation**: Use Zod schemas for input validation
- **Error handling**: Return consistent error responses

### Render Worker (apps/render-worker)
- **Services**: Create focused service classes for different responsibilities
- **Error handling**: Implement retry logic and graceful degradation
- **Monitoring**: Add metrics and logging for observability
- **Testing**: Mock external services in tests

### Packages
- **Shared utilities**: Keep packages focused and well-documented
- **TypeScript**: Export clear, well-typed interfaces
- **Dependencies**: Minimize external dependencies
- **Documentation**: Include README with usage examples

## Security Guidelines

### Authentication
- **Never store secrets** in source or config files
- **Redact or hash** sample credentials in examples
- **Assume least privilege** for all CLI instructions (--read-only, etc.)
- **Validate all inputs** at API boundaries
- **Implement proper authorization** checks

### Data Handling
- **Sanitize user inputs** to prevent injection attacks
- **Use parameterized queries** for database operations
- **Implement rate limiting** on public endpoints
- **Log security events** for monitoring

### Dependencies
- **Keep dependencies updated** to latest stable versions
- **Review security advisories** for known vulnerabilities
- **Use npm audit** to check for security issues
- **Minimize dependency surface area**

## Getting Help

### Resources
- **Architecture docs**: `docs/ARCHITECTURE.md`
- **Setup guide**: `HOW_TO_RUN.md`
- **API documentation**: Generated tRPC panel
- **Component library**: Storybook (when available)

### Community
- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Discord**: Real-time community chat (link in README)
- **Code reviews**: Learn from maintainer feedback

### Maintainer Contact
For complex architectural questions or major feature proposals, reach out to:
- **@brianhemphill**: Project lead and architecture decisions
- **GitHub issues**: Public discussion preferred

## Recognition

Contributors are recognized in:
- **CHANGELOG.md**: Feature additions and significant fixes
- **README.md**: Major contributors section
- **GitHub**: Automatic contribution graphs and statistics

Thank you for contributing to TerraShaper Pro! Your efforts help make landscape design more accessible and powerful for everyone.

---

*This contributing guide is living documentation. Please suggest improvements through issues or pull requests.*