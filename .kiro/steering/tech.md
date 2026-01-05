# Technology Stack

## Core Framework
- **Expo SDK**: ~54.0.25 (React Native framework)
- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: ~5.9.2

## Navigation & Routing
- **Expo Router**: ~6.0.15 (file-based routing)
- **React Navigation**: ^7.1.8 (bottom tabs, stack navigation)

## Database & State Management
- **SQLite**: ~16.0.9 (local database)
- **Drizzle ORM**: ^0.44.7 (type-safe database operations)
- **Zustand**: ^5.0.8 (state management)
- **AsyncStorage**: 2.2.0 (local storage)

## UI & Styling
- **NativeWind**: ^4.2.1 (Tailwind CSS for React Native)
- **Tailwind CSS**: ^3.4.18
- **React Native Reanimated**: ~4.1.1 (animations)
- **React Native Gesture Handler**: ~2.28.0

## Charts & Visualization
- **react-native-chart-kit**: ^6.12.0
- **react-native-svg**: 15.12.1

## AI Integration
- Custom AI agent system with OpenAI-compatible API support
- Multi-agent architecture for financial analysis

## Development Tools
- **ESLint**: ^9.25.0 (code linting)
- **Drizzle Kit**: ^0.31.7 (database migrations)

## Common Commands

```bash
# Development
npm start                 # Start Expo development server
npm run android          # Run on Android device/emulator
npm run ios             # Run on iOS device/simulator (macOS only)
npm run web             # Run on web browser

# Database
npx drizzle-kit generate # Generate database migrations
npx drizzle-kit migrate  # Run database migrations

# Code Quality
npm run lint            # Run ESLint code checking

# Build & Deploy
npx expo build          # Build for production
npx expo publish        # Publish updates
```

## Architecture Patterns

- **Repository Pattern**: Data access layer (`db/repositories/`)
- **Service Layer**: Business logic (`db/services/`)
- **Component-Based**: Reusable UI components
- **Context Providers**: Theme and database context
- **Custom Hooks**: Reusable logic (`hooks/`)

## Key Dependencies

- **File Operations**: expo-file-system, expo-document-picker
- **Image Handling**: expo-image, expo-image-picker
- **Utilities**: big.js (decimal calculations), uuid (ID generation)
- **Data Processing**: xlsx (Excel export), iconv-lite (encoding)