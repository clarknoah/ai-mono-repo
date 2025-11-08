# CLAUDE.md - AI Agent Quick Reference

**Purpose**: This file provides optimal context for AI agents working on the iAm monorepo.

**Last Updated**: 2025-11-06

---

## 🎯 Quick Orientation (Read This First)

### What is This?
AI-native NX monorepo using TypeScript, optimized for AI agent comprehension and development.

### Core Philosophy
1. **Spec-Driven**: Every component has SPEC.md defining its purpose
2. **Vertical Slices**: Code organized by domain/feature, not technical layer
3. **Token Efficient**: Structure minimizes context needed
4. **Type Safe**: End-to-end types from database → API → UI
5. **Consistent**: Uniform patterns across all packages

### Technology Stack
- **Monorepo**: NX 20.2 with pnpm
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL + Prisma
- **Cache**: Redis + ioredis
- **Jobs**: BullMQ
- **API** (planned): tRPC 11
- **Validation**: Zod
- **Testing**: Vitest

---

## 📂 Directory Structure (What Lives Where)

```
iam/
├── packages/
│   ├── domains/          # Business logic (auth, project, survey, etc.)
│   │   └── [domain]/
│   │       ├── SPEC.md           # ⭐ READ THIS FIRST
│   │       ├── src/
│   │       │   ├── entities/     # Domain entities (types/interfaces)
│   │       │   ├── services/     # Business logic
│   │       │   ├── repositories/ # Data access layer
│   │       │   ├── procedures/   # tRPC API procedures
│   │       │   ├── validators/   # Zod schemas
│   │       │   └── types/        # Domain-specific types
│   │       └── tests/            # Unit & integration tests
│   │
│   ├── platform/         # Infrastructure services
│   │   ├── database/     # ✅ Prisma client
│   │   ├── cache/        # ✅ Redis client
│   │   └── jobs/         # ✅ BullMQ queues
│   │
│   ├── shared/           # Cross-cutting utilities
│   │   ├── types/        # ✅ Common types, branded IDs
│   │   ├── utils/        # ✅ Logger, async, validation
│   │   ├── constants/    # ✅ App constants
│   │   └── config/       # ✅ Env validation
│   │
│   ├── integrations/     # External services (empty - ready for use)
│   └── ui/               # UI packages (empty - ready for use)
│
├── runtimes/             # Executable applications (empty - ready for use)
├── databases/
│   └── prisma/           # ✅ Prisma schema
├── infrastructure/
│   └── docker/           # ✅ docker-compose.yml
└── docs/                 # ⭐ IMPORTANT DOCUMENTATION
    ├── adr/              # Architecture Decision Records
    ├── guides/           # Development guides
    └── standards/        # Coding standards
```

### Status Legend
- ✅ = Implemented and ready to use
- Empty = Directory exists, ready for your code

---

## 📖 Essential Reading Order

When starting work, read in this order to minimize tokens:

### 1. Task Context (5 min)
- User's request/issue
- This file (CLAUDE.md)

### 2. Relevant Specifications (10 min)
- `packages/domains/[relevant-domain]/SPEC.md` (if exists)
- `docs/standards/ROOT-STANDARDS.md` (coding standards)

### 3. Architecture (if needed)
- `ARCHITECTURE.md` (full system design)
- `docs/adr/` (specific decisions)

### 4. Implementation Patterns (5 min)
- `docs/standards/packages/DOMAIN-STANDARDS.md` (domain package patterns)
- Look at one example file from existing packages

### 5. Implement
- Follow patterns exactly as shown

**Total Context**: ~500 lines instead of 2000+

---

## 🚀 Common Tasks & Workflows

### Task 1: Add New Domain Package

```bash
# 1. Create structure
mkdir -p packages/domains/[name]/src/{entities,services,repositories,procedures,validators,types}
mkdir -p packages/domains/[name]/tests/{unit,integration}

# 2. Copy templates
cp packages/shared/types/package.json packages/domains/[name]/package.json
cp packages/shared/types/tsconfig.json packages/domains/[name]/tsconfig.json
cp packages/shared/types/project.json packages/domains/[name]/project.json

# 3. Create SPEC.md (see DOMAIN-STANDARDS.md for template)

# 4. Update package.json name: "@iam/[name]"

# 5. Add to tsconfig.base.json paths:
"@iam/[name]": ["packages/domains/[name]/src/index.ts"]

# 6. Implement following DOMAIN-STANDARDS.md
```

**Files to Read**:
- `docs/standards/packages/DOMAIN-STANDARDS.md` (full template)
- `packages/shared/types/` (for package.json example)

### Task 2: Add Database Model

```bash
# 1. Edit schema
vim databases/prisma/schema.prisma

# 2. Create migration
pnpm --filter @iam/database db:migrate

# 3. Generate client
pnpm --filter @iam/database db:generate
```

**Pattern**:
```prisma
model MyModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("my_models")
}
```

### Task 3: Add Service to Domain

**File**: `packages/domains/[domain]/src/services/[name].service.ts`

**Pattern**:
```typescript
import { logger } from '@iam/shared-utils';
import type { MyRepository } from '../repositories/my.repository';

export class MyService {
  constructor(
    private readonly myRepository: MyRepository
  ) {}

  public async doSomething(input: MyInput): Promise<MyOutput> {
    // 1. Validate input (if needed)
    // 2. Business logic
    // 3. Call repository
    // 4. Return result

    logger.info('Did something', { input });
    return result;
  }

  private helperMethod(): void {
    // Private helpers
  }
}
```

**Must Include**:
- Type annotations on all parameters and returns
- Constructor dependency injection
- Public/private method separation
- Logging for important operations

### Task 4: Add tRPC Procedure

**File**: `packages/domains/[domain]/src/procedures/[name].procedure.ts`

**Pattern**:
```typescript
import { z } from 'zod';
import { publicProcedure } from '@iam/api-context'; // When created
import { myInputValidator } from '../validators/myInput.validator';

export const myProcedure = publicProcedure
  .input(myInputValidator)
  .output(z.object({
    // output schema
  }))
  .mutation(async ({ input, ctx }) => {
    const service = new MyService(ctx.myRepository);
    return await service.doSomething(input);
  });
```

### Task 5: Add Validator

**File**: `packages/domains/[domain]/src/validators/myInput.validator.ts`

**Pattern**:
```typescript
import { z } from 'zod';

export const myInputValidator = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(150).optional(),
});

export type MyInput = z.infer<typeof myInputValidator>;
```

### Task 6: Write Tests

**File**: `packages/domains/[domain]/tests/unit/[service].service.unit.test.ts`

**Pattern**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyService } from '../../src/services/my.service';

describe('MyService', () => {
  let service: MyService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
    };
    service = new MyService(mockRepository);
  });

  describe('doSomething', () => {
    it('should do something correctly', async () => {
      // Arrange
      const input = { name: 'test' };
      mockRepository.findById.mockResolvedValue({ id: '1' });

      // Act
      const result = await service.doSomething(input);

      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledOnce();
    });
  });
});
```

---

## 📋 Standards Quick Reference

### File Naming
```
✅ userAuthentication.service.ts
✅ user.entity.ts
✅ loginInput.validator.ts
✅ login.procedure.ts
✅ user.repository.ts
✅ userAuthentication.service.unit.test.ts

❌ authService.ts
❌ userEntity.ts
❌ login.ts
```

### Import Order
```typescript
// 1. External packages
import { z } from 'zod';
import express from 'express';

// 2. Internal packages
import { logger } from '@iam/shared-utils';
import type { User } from '@iam/shared-types';

// 3. Relative imports
import { config } from './config';
import { helper } from './helper';
```

### Type Annotations
```typescript
// ✅ Always annotate function returns
export function calculate(x: number): number {
  return x * 2;
}

// ✅ Annotate complex types
export async function fetchUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Don't rely on inference for public APIs
export function calculate(x: number) {
  return x * 2;
}
```

### Error Handling
```typescript
// ✅ Create domain-specific errors
export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// ✅ Let errors bubble to boundaries
export async function getUser(id: string): Promise<User> {
  const user = await repository.findById(id); // May throw
  return user;
}

// ❌ Don't swallow errors
try {
  await doSomething();
} catch (error) {
  console.log('error'); // Lost context!
}
```

---

## 🔍 Finding Things Quickly

### "Where does X go?"

| What | Where | Example |
|------|-------|---------|
| Business logic | Domain service | `packages/domains/auth/src/services/` |
| Database queries | Repository | `packages/domains/auth/src/repositories/` |
| API endpoints | tRPC procedure | `packages/domains/auth/src/procedures/` |
| Input validation | Validator | `packages/domains/auth/src/validators/` |
| Shared types | @iam/shared-types | `packages/shared/types/src/` |
| Utilities | @iam/shared-utils | `packages/shared/utils/src/` |
| Database schema | Prisma | `databases/prisma/schema.prisma` |
| Constants | @iam/shared-constants | `packages/shared/constants/src/` |

### "How do I...?"

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Run tests | `pnpm test` |
| Run tests for package | `pnpm --filter @iam/auth test` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Build all | `pnpm build` |
| Database migrate | `pnpm --filter @iam/database db:migrate` |
| Database studio | `pnpm --filter @iam/database db:studio` |
| View dep graph | `pnpm graph` |
| Start infrastructure | `cd infrastructure/docker && docker-compose up -d` |

---

## ✅ Pre-Implementation Checklist

Before writing code, ensure you've:

- [ ] Read relevant SPEC.md
- [ ] Read DOMAIN-STANDARDS.md (for domain packages)
- [ ] Looked at 1-2 example files
- [ ] Understand the pattern to follow
- [ ] Know where files should go
- [ ] Understand dependencies (can domain depend on X?)

---

## 🎨 Code Generation Patterns

### When Generating Code

1. **Match existing patterns EXACTLY**
   - Don't invent new patterns
   - Copy structure from similar files
   - Use same naming conventions

2. **Include all type annotations**
   - Function parameters
   - Return types
   - Complex variables

3. **Add appropriate logging**
   - Info for successful operations
   - Warn for unusual situations
   - Error for failures

4. **Write tests alongside**
   - Unit tests for services
   - Integration tests for procedures
   - Fixtures for test data

5. **Update documentation**
   - Update SPEC.md if adding capabilities
   - Add JSDoc comments for public APIs
   - Update README if needed

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T
1. Use `any` type (use `unknown` if truly needed)
2. Create domain-to-domain dependencies (use events)
3. Put business logic in procedures (belongs in services)
4. Skip writing tests
5. Use abbreviations in file names
6. Access `process.env` directly (use validated config)
7. Use `console.log` (use logger from @iam/shared-utils)
8. Create deep import paths (`@iam/auth/src/services/...`)

### ✅ DO
1. Use strict TypeScript
2. Annotate all function returns
3. Follow existing patterns exactly
4. Write descriptive variable names
5. Keep functions small (<50 lines)
6. Use dependency injection
7. Log important operations
8. Handle errors at boundaries

---

## 📊 Dependency Rules (Enforced by NX)

```
Runtime (api, workers)
    ↓ can use
Domain (auth, project)
    ↓ can use
Platform (database, cache, jobs)
    ↓ can use
Shared (types, utils, constants, config)

RULES:
✅ Domain → Platform
✅ Domain → Shared
✅ Platform → Shared
✅ Runtime → Domain
✅ Runtime → Platform
✅ Runtime → Shared

❌ Domain → Domain (requires approval)
❌ Shared → Platform
❌ Platform → Domain
❌ Any → Runtime
```

---

## 🎯 Optimization for AI Agents

### Token Efficiency Tips

1. **Read specs first** - SPEC.md tells you what to do
2. **One example suffices** - Don't read all similar files
3. **Use grep/search** - Find patterns without reading everything
4. **Trust the structure** - Files are where you expect
5. **Follow templates** - Don't overthink, copy and adapt

### Context Loading Strategy

```
Minimal Context (Recommended):
├─ CLAUDE.md (this file) - 300 lines
├─ Relevant SPEC.md - 50 lines
├─ DOMAIN-STANDARDS.md - 200 lines
├─ One example file - 50 lines
└─ Total: ~600 lines

Comprehensive Context (If needed):
├─ Above + ARCHITECTURE.md - 400 lines
├─ Above + Relevant ADR - 100 lines
└─ Total: ~1100 lines
```

Start minimal, expand only if needed.

---

## 📞 Getting Unstuck

### If you're not sure...

1. **Check SPEC.md** - Does it define this?
2. **Check STANDARDS.md** - Is there a pattern?
3. **Look at examples** - How did others do it?
4. **Check ADRs** - Was this decided?
5. **Ask user** - When truly ambiguous

### Quick Reference Docs

| Question | Read This |
|----------|-----------|
| How should code be structured? | `docs/standards/ROOT-STANDARDS.md` |
| How do domains work? | `docs/standards/packages/DOMAIN-STANDARDS.md` |
| Why was X chosen? | `docs/adr/` |
| How do I set up? | `docs/guides/getting-started.md` |
| How to work with AI? | `docs/guides/ai-development.md` |
| What's the architecture? | `ARCHITECTURE.md` |
| What was researched? | `docs/AI-NATIVE-RESEARCH-SUMMARY.md` |

---

## 💡 Working Example: Complete Feature Flow

### User Request
"Add password reset functionality to auth domain"

### AI Workflow

**1. Context (Read ~300 lines)**
```
✓ This file (CLAUDE.md)
✓ packages/domains/auth/SPEC.md (if exists)
✓ docs/standards/packages/DOMAIN-STANDARDS.md
```

**2. Plan (Write spec)**
```markdown
## Password Reset Feature

### Database Changes
- Add PasswordResetToken model

### New Files
- entities/passwordResetToken.entity.ts
- repositories/passwordResetToken.repository.ts
- services/passwordReset.service.ts
- validators/requestPasswordResetInput.validator.ts
- validators/resetPasswordInput.validator.ts
- procedures/requestPasswordReset.procedure.ts
- procedures/resetPassword.procedure.ts

### Tests
- Unit: passwordReset.service.unit.test.ts
- Integration: passwordReset.integration.test.ts
```

**3. Implement (Following patterns)**
- Copy structure from existing files
- Match naming conventions
- Include all types
- Add logging
- Write tests

**4. Verify**
```bash
pnpm typecheck  # No errors
pnpm lint       # No errors
pnpm test       # All pass
pnpm build      # Builds successfully
```

**5. Document**
- Update auth SPEC.md
- Add usage examples

**Total Time**: ~30 min vs ~2 hours without structure

---

## 🔄 Workflow Summary

```
User Request
    ↓
Read CLAUDE.md (this file)
    ↓
Read relevant SPEC.md
    ↓
Read STANDARDS.md for pattern
    ↓
Look at ONE example file
    ↓
Generate code matching pattern
    ↓
Write tests
    ↓
Verify (typecheck, lint, test, build)
    ↓
Update docs
    ↓
Done!
```

---

## 📝 Current State (What Exists)

### ✅ Ready to Use
- Shared packages (types, utils, constants, config)
- Platform packages (database, cache, jobs)
- Prisma schema (User, Session, Project, Survey)
- Docker Compose (Postgres, Redis, Neo4j)
- All documentation and standards
- Testing setup (Vitest)
- Build system (NX)

### 🏗️ Ready to Build
- Domain packages (auth, project, survey, session, sequence)
- Runtime applications (API, workers)
- UI packages (web, mobile)
- Integration packages (external services)
- E2E tests

### 📦 Available Imports

```typescript
// Shared
import type { UserId, Result } from '@iam/shared-types';
import { logger, sleep, retry } from '@iam/shared-utils';
import { CACHE_TTL, RATE_LIMITS } from '@iam/shared-constants';
import { validateEnv, baseEnvSchema } from '@iam/shared-config';

// Platform
import { prisma } from '@iam/database';
import { cache, redis } from '@iam/cache';
import { createQueue, createWorker } from '@iam/jobs';
```

---

## 🎓 Remember

This monorepo is designed FOR YOU (AI agents). Trust the structure:

1. ✅ Files are where you expect
2. ✅ Patterns are consistent
3. ✅ Documentation is accurate
4. ✅ Standards exist for everything
5. ✅ Examples show the way

**Don't overthink. Follow the patterns. Ship quality code.** 🚀

---

**Last Updated**: 2025-11-06
**Maintainer**: AI-native development team
**Questions?** Check `docs/` or ask the user.
