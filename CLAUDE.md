# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medusa is an open-source ecommerce platform with a built-in framework for customization. It provides foundational commerce primitives for building advanced B2B/DTC stores, marketplaces, PoS systems, and service businesses.

## Essential Commands

### Development
```bash
# Install dependencies (uses Yarn workspaces)
yarn install

# Build all packages
yarn build

# Build specific package
yarn build --filter=@medusajs/medusa

# Start development mode
yarn dev

# Clean build artifacts
yarn clean
```

### Testing
```bash
# Run all tests
yarn test

# Run unit tests for a specific package
yarn test --filter=@medusajs/medusa

# Run integration tests (different suites)
cd integration-tests/http && yarn test:integration -- [file to run]
# NOTE: you cannot run tests with the -t flag - this will cause the test to time out.
```

### Code Quality
```bash
# Lint code
yarn lint

# Format code
yarn prettier:format

# Type check
yarn typecheck
```

### Release Management
```bash
# Create changeset for version bump
yarn changeset

# Version packages
yarn changeset version

# Publish packages
yarn changeset publish
```

## Architecture Overview

### Monorepo Structure
This is a Yarn workspace monorepo managed by Turbo. Key directories:

- **`packages/medusa/`** - Core Medusa server package containing the main API and framework
- **`packages/modules/`** - Commerce modules (30+ modules) that can be used independently:
  - Core commerce: product, cart, order, payment, customer, inventory
  - Infrastructure: event-bus, cache, workflow-engine
  - Each module has its own models, migrations, and services
- **`packages/core/`** - Framework components (types, utils, workflows, orchestration)
- **`packages/admin/`** - Admin dashboard and UI components
- **`packages/cli/`** - CLI tools including create-medusa-app
- **`packages/design-system/`** - Shared UI components and icons

### Module Architecture
Medusa follows a modular architecture where each commerce capability is encapsulated in a module:

1. **Module Independence**: Each module in `packages/modules/` is self-contained with:
   - Its own database models and migrations
   - Service layer for business logic
   - Repository pattern for data access
   - Module definition with dependency injection

2. **Communication Patterns**:
   - **Events**: Modules emit events through the event bus (local or Redis)
   - **Workflows**: Complex operations use the workflow engine for orchestration
   - **Remote Query**: Cross-module data fetching via the remote query system

3. **Provider Pattern**: External integrations follow a provider pattern:
   - Payment providers (e.g., Stripe in `packages/modules/providers/payment-stripe/`)
   - Notification providers (e.g., SendGrid)
   - File storage providers (local, S3)
   - Authentication providers (email/password, OAuth)

### API Structure
The API is split into two main parts:
- **Store API** (`packages/medusa/src/api/store/`) - Customer-facing endpoints
- **Admin API** (`packages/medusa/src/api/admin/`) - Admin/merchant endpoints

Each API route typically includes:
- Route handler with validation
- Corresponding workflow or service call
- Response transformation

### Workflow System
Complex operations use the workflow system (`packages/core/workflows-sdk/`):
- Workflows are composable, reusable business logic units
- Support for compensation (rollback) on failure
- Can be executed synchronously or asynchronously
- Located in `packages/core/core-flows/` for shared workflows

### Testing Approach
- **Unit Tests**: Located alongside source files as `*.spec.ts`
- **Integration Tests**: Separate `integration-tests/` directories in packages
- **API Tests**: Full API integration tests in `integration-tests/api/`
- **Module Tests**: Individual module integration tests in `integration-tests/modules/`

When writing tests:
- Use Jest as the test framework
- Follow existing patterns in the codebase
- Integration tests should use the test database setup
- Mock external services appropriately

### Development Patterns
1. **Service Pattern**: Business logic lives in service classes
2. **Repository Pattern**: Data access through repositories
3. **DTO Pattern**: Use DTOs for API request/response validation
4. **Event-Driven**: Emit events for cross-module communication
5. **Dependency Injection**: Use MikroORM and Awilix for DI

### Common Development Tasks
When adding new features:
1. For new API endpoints: Add route in `api/admin/` or `api/store/`
2. For new modules: Create in `packages/modules/` following existing patterns
3. For workflows: Add to `packages/core/core-flows/` or module-specific workflows
4. For admin UI: Work in `packages/admin/` packages

### Database and Migrations
- Uses MikroORM with PostgreSQL
- Migrations are module-specific
- Run migrations with module-specific commands
- Each module manages its own database schema