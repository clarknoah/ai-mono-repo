# Getting Started with iAm Monorepo

This guide will help you set up the iAm monorepo for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.18+ (use `nvm` to manage versions)
- **pnpm**: v9.0+ (`npm install -g pnpm`)
- **Docker**: For running databases locally
- **Docker Compose**: For orchestrating services
- **Git**: For version control

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd iam
```

### 2. Install Node Version

```bash
# Use the correct Node version
nvm use
# If you don't have it installed:
# nvm install
```

### 3. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all packages in the monorepo.

### 4. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred editor
# For local development, the defaults should work fine
```

### 5. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and Neo4j
cd infrastructure/docker
docker-compose up -d

# Check that all services are running
docker-compose ps
```

You should see:
- ✅ `iam-postgres` (PostgreSQL on port 5432)
- ✅ `iam-redis` (Redis on port 6379)
- ✅ `iam-neo4j` (Neo4j on ports 7474 & 7687)

### 6. Set Up the Database

```bash
# Go back to project root
cd ../..

# Generate Prisma client
pnpm --filter @iam/database db:generate

# Run database migrations
pnpm --filter @iam/database db:migrate

# (Optional) Seed the database
pnpm --filter @iam/database db:seed
```

### 7. Build All Packages

```bash
# Build all packages
pnpm build

# Or build only what's needed
pnpm nx run-many --target=build --all
```

### 8. Run Type Checking

```bash
# Check types across all packages
pnpm typecheck
```

### 9. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### 10. Start Development

```bash
# Start the API server (when implemented)
pnpm --filter @iam/api dev

# Or start all runtimes
pnpm dev
```

## Project Structure

```
iam/
├── packages/              # Reusable packages
│   ├── domains/          # Business domains (auth, project, etc.)
│   ├── platform/         # Platform services (database, cache, etc.)
│   ├── shared/           # Shared utilities and types
│   └── ui/               # UI packages
├── runtimes/             # Executable applications
│   ├── api/              # tRPC API server
│   ├── message-worker/   # Background job worker
│   └── time-worker/      # Scheduled jobs worker
├── databases/            # Database schemas and migrations
├── docs/                 # Documentation
└── infrastructure/       # Docker and IaC
```

## Common Tasks

### Running Specific Package Commands

```bash
# Run command in specific package
pnpm --filter @iam/auth test

# Run multiple packages
pnpm --filter "@iam/auth" --filter "@iam/project" test
```

### Working with Database

```bash
# Open Prisma Studio (visual DB editor)
pnpm --filter @iam/database db:studio

# Create a new migration
pnpm --filter @iam/database db:migrate

# Reset database (⚠️ destructive)
pnpm --filter @iam/database db:reset
```

### Working with NX

```bash
# View dependency graph
pnpm graph

# Run affected tests (only test what changed)
pnpm nx affected --target=test

# Clear NX cache
pnpm nx reset
```

### Code Quality

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Check formatting without changing files
pnpm format:check
```

## Development Workflow

### Adding a New Feature

1. **Read the specifications**
   - Check `docs/specs/` for relevant specs
   - Review `docs/standards/` for coding standards

2. **Create or modify packages**
   - Follow vertical slice architecture
   - Add to appropriate domain package

3. **Write tests**
   - Unit tests for services
   - Integration tests for complete flows
   - E2E tests for critical paths

4. **Update documentation**
   - Update SPEC.md if adding new capabilities
   - Add examples to README

5. **Run quality checks**
   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   ```

6. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(domain): add new feature"
   ```

### Creating a New Domain Package

1. **Create directory structure**
   ```bash
   mkdir -p packages/domains/my-domain/src/{entities,services,repositories,procedures,validators,types}
   mkdir -p packages/domains/my-domain/tests/{unit,integration,fixtures}
   ```

2. **Copy templates from existing domain**
   ```bash
   cp packages/domains/auth/SPEC.md packages/domains/my-domain/
   cp packages/domains/auth/package.json packages/domains/my-domain/
   cp packages/domains/auth/project.json packages/domains/my-domain/
   cp packages/domains/auth/tsconfig.json packages/domains/my-domain/
   ```

3. **Update files with your domain name**

4. **Add to tsconfig.base.json paths**
   ```json
   {
     "paths": {
       "@iam/my-domain": ["packages/domains/my-domain/src/index.ts"]
     }
   }
   ```

5. **Implement your domain**

## Accessing Services

### Database UIs

- **Prisma Studio**: `pnpm --filter @iam/database db:studio`
- **PostgreSQL**: Connect with any PostgreSQL client to `localhost:5432`

### Neo4j Browser

Open http://localhost:7474 in your browser:
- Username: `neo4j`
- Password: `iam_dev_password`

### Redis Commander (Optional)

```bash
# Start Redis Commander
cd infrastructure/docker
docker-compose --profile tools up -d redis-commander
```

Open http://localhost:8081

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :7687  # Neo4j

# Stop the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if Docker containers are running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs neo4j

# Restart services
docker-compose restart
```

### Prisma Issues

```bash
# Reset Prisma client
rm -rf node_modules/.prisma
pnpm --filter @iam/database db:generate

# Reset database
pnpm --filter @iam/database db:reset
```

### NX Cache Issues

```bash
# Clear NX cache
pnpm nx reset

# Clear all build outputs
pnpm clean
```

### pnpm Issues

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## Next Steps

- Read the [Architecture Documentation](../../ARCHITECTURE.md)
- Review [Architecture Decision Records](../adr/)
- Check [Coding Standards](../standards/)
- Explore existing domains in `packages/domains/`

## Getting Help

- **Documentation**: See `docs/` directory
- **Issues**: Check GitHub Issues
- **Team**: Ask in team chat

## Additional Resources

- [NX Documentation](https://nx.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Neo4j Documentation](https://neo4j.com/docs)
