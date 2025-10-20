# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sound Buttons is a Next.js 15 application using the App Router with Mantine UI components. The project uses TypeScript with strict mode enabled and leverages Turbopack for fast builds.

## Tech Stack

- **Framework**: Next.js 15.5.6 (App Router)
- **Build Tool**: Turbopack (via `--turbopack` flag)
- **UI Library**: Mantine v8.3.5 (complete suite including core, hooks, dates, nprogress)
- **Styling**: CSS Modules + PostCSS with Mantine preset
- **Language**: TypeScript 5 (strict mode)
- **Date Handling**: Day.js 1.11.18
- **Testing**: Vitest 3.2.4 with jsdom and React Testing Library

## Common Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack on localhost:3000
npm run build        # Production build with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run all tests with Vitest
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage report
```

### TypeScript Checking
```bash
npx tsc --noEmit     # Type check without emitting files
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Mantine provider and color scheme setup
  - `page.tsx` - Home page component
  - `globals.css` - Global styles
  - `*.module.css` - Component-scoped CSS modules
- `src/components/` - React components organized by feature
  - `RecordButton/` - Audio recording UI with waveform visualization
  - `SoundButton/` - Individual playback button for recordings
  - `SoundGrid/` - Grid layout displaying all recordings
- `src/hooks/` - Custom React hooks
  - `useAudioRecorder.ts` - Core audio recording logic with MediaRecorder API
- `src/services/` - Business logic and external integrations
  - `audioStorage.ts` - IndexedDB wrapper for persistent audio storage
- `src/types/` - TypeScript type definitions
  - `audio.ts` - Audio-related types (Recording, RecordingState, etc.)
  - `global.d.ts` - Global type declarations
- `public/` - Static assets (SVGs for UI icons)

### Path Aliases

The project uses `@/*` path alias pointing to `./src/*` (configured in tsconfig.json and vitest.config.ts).

### Data Flow Architecture

**Recording Flow**:
1. `useAudioRecorder` hook manages MediaRecorder API and Web Audio API for waveform visualization
2. `RecordButton` component uses the hook and emits recording completion events
3. `page.tsx` (Home) receives completed recordings and saves to IndexedDB via `audioStorage`
4. State updates trigger re-render of `SoundGrid` with new recordings

**Storage Layer**:
- All audio recordings are stored in IndexedDB (database: `SoundButtonsDB`, store: `recordings`)
- Blobs are converted to ArrayBuffer for storage and reconstructed on retrieval
- Recordings are indexed by `createdAt` for chronological ordering (newest first)
- The `audioStorage` service provides a singleton instance with CRUD operations

**Audio Recording**:
- Uses Web Audio API (`AudioContext`, `AnalyserNode`) for real-time waveform visualization
- Uses MediaRecorder API for actual audio capture
- Auto-detects supported MIME types (prefers `audio/webm;codecs=opus`)
- Maximum recording duration: 30 seconds (enforced by timeout)
- Proper cleanup of media streams, audio contexts, and timers on stop/unmount

### Mantine Setup

Mantine is fully configured with:
- Global styles imported in root layout
- `MantineProvider` wrapping all components
- `ColorSchemeScript` for theme management
- PostCSS with Mantine preset and custom breakpoint variables
- Responsive breakpoints: xs (36em), sm (48em), md (62em), lg (75em), xl (88em)

### Styling Approach

- CSS Modules for component-scoped styles (`.module.css`)
- Mantine components with built-in styling props
- PostCSS for processing with simple-vars support
- Global styles in `globals.css`

## Development Conventions

### Component Structure

- Use functional components with TypeScript
- Import Mantine components from `@mantine/core`
- Use CSS Modules for custom styling alongside Mantine
- Keep metadata exports for SEO (title, description)

### Testing

- Tests are co-located with components (e.g., `WaveformVisualizer.test.tsx`)
- Vitest with jsdom environment for DOM testing
- React Testing Library for component testing
- Global test utilities in `vitest.setup.ts`

### TypeScript Configuration

- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- JSX: preserve (handled by Next.js)
- No emit (Next.js handles compilation)

### ESLint Configuration

- Extends `next/core-web-vitals` and `next/typescript`
- Uses flat config format with FlatCompat
- Ignores: node_modules, .next, out, build, next-env.d.ts

## Build & Production

The project uses Turbopack for both development and production builds:
- Development: Fast refresh and instant updates
- Production: Optimized bundles with automatic code splitting
- Static assets served from `/public` directory
- Automatic font optimization with next/font (Geist font family)

## Important Notes

- Always use `--turbopack` flag for dev and build (already in package.json scripts)
- Mantine requires style imports - already configured in root layout
- React 19 and Next.js 15 are used (latest versions)
- Test files should be co-located with their corresponding components
- Audio recordings have a hard limit of 30 seconds
- IndexedDB is required for persistence - no server-side storage
