# Project Structure

## Directory Organization

```
smallCount/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (tabs)/            # Tab navigation pages
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── ledgers.tsx    # Account management
│   │   ├── stats.tsx      # Statistics/Charts
│   │   └── profile.tsx    # User profile/settings
│   ├── transaction/       # Transaction-related pages
│   │   ├── add.tsx        # Add transaction
│   │   ├── edit/[id].tsx  # Edit transaction (dynamic route)
│   │   └── [id].tsx       # Transaction details
│   ├── ai.tsx            # AI assistant page
│   └── _layout.tsx       # Root layout with providers
├── components/            # Reusable UI components
│   ├── biz/              # Business-specific components
│   │   ├── charts/       # Chart components
│   │   └── TransactionItem.tsx
│   ├── ui/               # Generic UI components
│   │   ├── AddTransaction/ # Transaction form components
│   │   ├── Card.tsx      # Base card component
│   │   └── BottomNav.tsx
│   └── widgets/          # Composite widgets
├── db/                   # Database layer
│   ├── schema.ts         # Drizzle schema definitions
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic layer
│   └── migrations/       # Database migrations
├── ai/                   # AI system
│   ├── lib/             # Core AI engine
│   ├── prompts/         # Agent prompts
│   └── tools/           # AI tools/functions
├── context/             # React contexts
├── hooks/               # Custom React hooks
├── storage/             # State management
│   └── store/           # Zustand stores
├── theme/               # Theme configuration
├── constants/           # App constants
└── utils/               # Utility functions
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (`TransactionItem.tsx`, `Card.tsx`)
- **Pages**: camelCase (`index.tsx`, `ledgers.tsx`)
- **Utilities**: camelCase (`format.ts`, `validation.ts`)
- **Constants**: camelCase (`type.ts`, `data.ts`)
- **Directories**: camelCase (`components/`, `utils/`)

### Code
- **Components**: PascalCase (`TransactionItem`, `CategorySelector`)
- **Functions**: camelCase (`createTransaction`, `formatCurrency`)
- **Variables**: camelCase (`transactionData`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (`ACCOUNT_TYPES`, `AGENT_IDS`)
- **Types/Interfaces**: PascalCase (`Transaction`, `PaymentMethod`)

## Architecture Layers

### 1. Presentation Layer (`app/`, `components/`)
- Expo Router pages for navigation
- Reusable UI components with NativeWind styling
- Business components for domain-specific UI

### 2. Business Logic Layer (`db/services/`)
- Service classes handle business rules
- Transaction validation and processing
- Data aggregation and statistics

### 3. Data Access Layer (`db/repositories/`)
- Repository pattern for database operations
- Type-safe Drizzle ORM queries
- CRUD operations with proper error handling

### 4. Database Layer (`db/schema.ts`, `db/migrations/`)
- SQLite schema with Drizzle ORM
- Migration files for schema changes
- Proper foreign key relationships

## Component Organization

### UI Components (`components/ui/`)
- Generic, reusable components
- No business logic dependencies
- Consistent styling with theme support

### Business Components (`components/biz/`)
- Domain-specific components
- Can use services and repositories
- Handle business logic presentation

### Widgets (`components/widgets/`)
- Composite components combining multiple UI elements
- Self-contained functionality
- Reusable across different pages

## State Management

### Zustand Stores (`storage/store/`)
- `useDataStore`: Transaction and account data
- `useSettingStore`: App settings and preferences
- `useStatsStore`: Statistics and analytics data

### React Context (`context/`)
- `ThemeContext`: Theme and appearance settings
- `DbContext`: Database connection and initialization

## File Import Patterns

```typescript
// Absolute imports using @ alias
import { TransactionService } from '@/db/services/TransactionService';
import { useTheme } from '@/context/ThemeContext';
import Card from '@/components/ui/Card';

// Relative imports for same directory
import './global.css';
import { formatCurrency } from '../utils/format';
```

## Database Schema Patterns

- **UUID Primary Keys**: All tables use text UUID primary keys
- **Timestamps**: `createdAt` and `updatedAt` fields with Unix timestamps
- **Soft Deletes**: Use `isArchived` boolean instead of hard deletes
- **Foreign Keys**: Proper cascade relationships with `onDelete: "cascade"`
- **Enums**: Use text fields with enum constraints for type safety