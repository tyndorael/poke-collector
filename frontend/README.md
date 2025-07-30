# Poke Collector Frontend

<p align="center">
  <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" width="80" alt="Next.js Logo" />
</p>

A modern, responsive web application built with Next.js 15 for managing and tracking Pokémon card collections. Features a beautiful UI with dark/light theme support, real-time data updates, and an intuitive user experience.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Theme Support**: Dark and light theme with system preference detection
- **Authentication**: Secure user authentication with JWT
- **Card Management**: Browse, search, and filter Pokémon cards
- **Collection System**: Create and manage multiple card collections
- **Dashboard Analytics**: Visual statistics and collection insights
- **Real-time Updates**: Live data synchronization with SWR
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Type Safety**: Full TypeScript integration
- **Performance**: Optimized with Next.js 15 and Turbopack
- **Accessibility**: WCAG compliant with Radix UI primitives

## 🛠️ Tech Stack

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 19](https://react.dev/)** - Latest React with Server Components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Headless accessible components
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[SWR](https://swr.vercel.app/)** - Data fetching with caching
- **[Recharts](https://recharts.org/)** - Data visualization
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

## 📁 Project Structure

```
app/                      # Next.js App Router
├── (auth)/              # Auth route group
│   └── login/           # Login page
├── cards/              # Card management pages
│   ├── page.tsx        # Cards listing
│   └── table/          # Card table components
├── collections/        # Collection pages
│   ├── page.tsx        # Collections listing
│   └── [id]/          # Dynamic collection pages
├── dashboard/          # Dashboard page
├── sets/              # Set management pages
│   ├── page.tsx        # Sets listing
│   └── [id]/          # Dynamic set pages
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx           # Home page

components/             # Reusable components
├── ui/                # Base UI components (shadcn/ui)
├── providers/         # Context providers
├── card-table/        # Card table components
├── collection-card-table/  # Collection-specific tables
├── forms/             # Form components
└── navigation/        # Navigation components

hooks/                 # Custom React hooks
├── useAuth.ts         # Authentication hook
├── use-media-query.tsx # Responsive utilities
└── use-mobile.ts      # Mobile detection

lib/                   # Utility libraries
├── api.ts            # API client configuration
├── auth.tsx          # Auth utilities
├── config.ts         # App configuration
├── fonts.ts          # Font configurations
└── utils.ts          # General utilities

types/                 # TypeScript type definitions
└── index.ts          # Shared types

public/               # Static assets
├── icons/           # App icons
└── images/          # Images and graphics
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **npm** or **yarn**
- **Backend API** running (see backend README)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Configure your `.env.local` file:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

   # App Configuration
   NEXT_PUBLIC_APP_NAME="Poke Collector"
   NEXT_PUBLIC_APP_VERSION="1.0.0"

   # Optional: Analytics
   NEXT_PUBLIC_GA_TRACKING_ID=your-ga-tracking-id
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Development with Backend

Make sure the backend API is running on `http://localhost:3000/api/v1` before starting the frontend.

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run dev:legacy       # Start without Turbopack (if needed)

# Building
npm run build           # Build for production
npm run start           # Start production server
npm run export          # Export static site

# Code Quality
npm run lint            # Run Next.js linter
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check Prettier formatting

# Type Checking
npm run type-check      # Run TypeScript compiler check

# Testing (if configured)
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

### Development Server Options

```bash
# Start with Turbopack (faster)
npm run dev

# Start on different port
npm run dev -- -p 3001

# Start with specific hostname
npm run dev -- -H 0.0.0.0
```

## 🎨 UI Components

### Component Library

This project uses a custom component library based on **shadcn/ui** with **Radix UI** primitives:

```tsx
// Example usage of UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input placeholder="Search cards..." />
          <Button>Search</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Available Components

- **Forms**: Input, Textarea, Select, Checkbox, Radio
- **Navigation**: Sidebar, Breadcrumbs, Tabs
- **Feedback**: Toast, Alert, Dialog, Tooltip
- **Data Display**: Table, Card, Badge, Avatar
- **Layout**: Container, Grid, Flex utilities

### Theme System

```tsx
// Using theme context
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle theme</button>;
}
```

## 📊 State Management

### Data Fetching with SWR

```tsx
import useSWR from 'swr';
import { api } from '@/lib/api';

export function useCards(params = {}) {
  const { data, error, mutate } = useSWR(['/cards', params], ([url, params]) =>
    api.get(url, { params }).then((res) => res.data),
  );

  return {
    cards: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

### Authentication State

```tsx
import { useAuth } from '@/hooks/useAuth';

export function ProtectedComponent() {
  const { user, isLoading, login, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.firstName}!</div>;
}
```

## 🔧 Configuration

### API Client Setup

```typescript
// lib/api.ts
import axios from 'axios';
import { getToken, removeToken } from './auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... custom color palette
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build Optimization

```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': ['@svgr/webpack'],
      },
    },
  },
  images: {
    domains: ['assets.tcgdx.net', 'images.pokemontcg.io'],
    formats: ['image/webp', 'image/avif'],
  },
  output: 'standalone', // For Docker
};

module.exports = nextConfig;
```

## 🔐 Security & Performance

### Security Best Practices

- **Environment Variables**: Never expose sensitive data in client-side code
- **HTTPS**: Always use HTTPS in production
- **Content Security Policy**: Implemented via headers
- **XSS Protection**: Sanitize user inputs
- **CSRF Protection**: Token-based protection

### Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: ISR for better performance
- **Bundle Analysis**: Use `@next/bundle-analyzer`

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

## 📱 Mobile & Responsive Design

### Responsive Breakpoints

```css
/* Mobile first approach */
.container {
  @apply px-4; /* Mobile */
  @apply sm:px-6; /* Small screens (640px+) */
  @apply md:px-8; /* Medium screens (768px+) */
  @apply lg:px-12; /* Large screens (1024px+) */
  @apply xl:px-16; /* Extra large (1280px+) */
}
```

### Mobile-Specific Features

- **Touch Gestures**: Swipe navigation for mobile
- **Responsive Tables**: Horizontal scroll on mobile
- **Mobile Menu**: Collapsible navigation
- **Progressive Web App**: PWA capabilities (can be added)

## 🧪 Testing (Optional Setup)

### Jest + Testing Library Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### Example Test

```tsx
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 🐛 Troubleshooting

### Common Issues

**Module Resolution Errors:**

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors:**

```bash
# Check types
npm run type-check

# Restart TypeScript server in VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

**Build Errors:**

```bash
# Check for unused imports
npm run lint

# Build with debug info
npm run build -- --debug
```

**Styling Issues:**

```bash
# Rebuild Tailwind classes
npm run dev

# Check for conflicting CSS
# Inspect elements in browser dev tools
```

## 📖 Additional Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[React Documentation](https://react.dev/)** - React 19 features
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - Styling guide
- **[Radix UI Documentation](https://www.radix-ui.com/docs)** - Component primitives
- **[SWR Documentation](https://swr.vercel.app/)** - Data fetching patterns

### Code Standards

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind utility classes
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add JSDoc comments for complex functions
- **Accessibility**: Ensure components are accessible
- **Performance**: Optimize re-renders with React.memo when needed

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.
