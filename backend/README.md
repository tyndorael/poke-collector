# Poke Collector Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="80" alt="Nest Logo" /></a>
</p>

A robust RESTful API built with NestJS for managing Pokémon card collections. This backend service provides authentication, card management, collection tracking, and statistics for the Poke Collector application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with Passport.js
- **Card Management**: Browse, search, and manage Pokémon cards
- **Collection System**: Create and manage multiple card collections
- **Set Management**: Organize cards by Pokémon sets
- **Statistics & Analytics**: Track collection progress and statistics
- **Data Synchronization**: Sync card data from TCGdex API
- **Caching**: Redis integration for improved performance
- **File Storage**: MinIO integration for image and file handling
- **API Documentation**: Auto-generated Swagger documentation
- **Data Validation**: Comprehensive input validation with class-validator
- **Database ORM**: TypeORM with PostgreSQL

## 🛠️ Tech Stack

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[TypeORM](https://typeorm.io/)** - Database ORM and migrations
- **[Redis](https://redis.io/)** - Caching and session storage
- **[JWT](https://jwt.io/) + [Passport](http://www.passportjs.org/)** - Authentication
- **[Swagger](https://swagger.io/)** - API documentation
- **[class-validator](https://github.com/typestack/class-validator)** - Validation
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing
- **[TCGdx SDK](https://tcgdx.net/)** - Pokémon card data source

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts    # Auth endpoints
│   ├── auth.service.ts       # Auth business logic
│   ├── guards/              # Auth guards
│   ├── strategies/          # Passport strategies
│   └── dto/                 # Auth DTOs
├── cards/               # Card management module
│   ├── cards.controller.ts   # Card endpoints
│   ├── cards.service.ts      # Card business logic
│   ├── entities/            # Card entities
│   └── dto/                 # Card DTOs
├── collections/         # Collection management module
│   ├── collections.controller.ts
│   ├── collections.service.ts
│   ├── entities/
│   └── dto/
├── sets/               # Set management module
│   ├── sets.controller.ts
│   ├── sets.service.ts
│   ├── entities/
│   └── dto/
├── stats/              # Statistics module
│   ├── stats.controller.ts
│   └── stats.service.ts
├── users/              # User management module
│   ├── users.service.ts
│   ├── entities/
│   └── dto/
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **npm** or **yarn**
- **PostgreSQL** v15+
- **Redis** v7+
- **Docker & Docker Compose** (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Application
   NODE_ENV=development
   PORT=3000
   
   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=poke-collector
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # MinIO (Object Storage)
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET_NAME=poke-collector
   
   # TCGdx API
   TCGDX_API_URL=https://api.tcgdx.net/v2
   ```

3. **Start required services**
   ```bash
   # Using Docker Compose (recommended)
   docker compose up -d postgres redis minio
   
   # Or start services manually if you have them installed locally
   ```

4. **Run database migrations**
   ```bash
   npm run migration:run
   ```

### Development

```bash
# Start in development mode with hot reload
npm run start:dev

# Start in debug mode (port 9229)
npm run start:debug

# Build the application
npm run build

# Start production build
npm run start:prod
```

The API will be available at:
- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/v1`

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
GET  /api/v1/auth/profile      # Get user profile (protected)
```

### Card Endpoints
```
GET    /api/v1/cards           # Get cards with filtering/pagination
GET    /api/v1/cards/:id       # Get specific card
POST   /api/v1/cards/sync-all  # Sync all cards from TCGdx
GET    /api/v1/cards/search    # Search cards by name/text
```

### Collection Endpoints
```
GET    /api/v1/collections     # Get user collections
POST   /api/v1/collections     # Create new collection
GET    /api/v1/collections/:id # Get specific collection
PUT    /api/v1/collections/:id # Update collection
DELETE /api/v1/collections/:id # Delete collection
POST   /api/v1/collections/:id/cards # Add card to collection
```

### Set Endpoints
```
GET /api/v1/sets              # Get all sets
GET /api/v1/sets/:id          # Get specific set
GET /api/v1/sets/:id/cards    # Get cards in set
```

### Statistics Endpoints
```
GET /api/v1/stats/overview    # Get collection overview
GET /api/v1/stats/user        # Get user statistics
```

### Example API Requests

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "collector",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Get cards with filtering:**
```bash
curl -X GET "http://localhost:3000/api/v1/cards?page=1&limit=10&search=pikachu" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov

# Run tests in debug mode
npm run test:debug
```

### Test Structure
```
test/
├── app.e2e-spec.ts      # End-to-end tests
├── jest-e2e.json        # E2E Jest configuration
└── fixtures/            # Test data fixtures
```

## 🔧 Development Scripts

```bash
# Development
npm run start:dev         # Start with hot reload
npm run start:debug       # Start in debug mode

# Building
npm run build            # Build for production
npm run start:prod       # Start production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check Prettier formatting

# Database
npm run migration:generate  # Generate new migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run schema:sync        # Sync schema (dev only)

# Testing
npm run test             # Unit tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker compose up --build

# Start in background
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down
```

### Production Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🔐 Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt
- **Input Validation** using class-validator
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** (can be implemented with @nestjs/throttler)
- **Helmet Integration** for security headers
- **Environment Variable Protection**

## 📊 Performance & Monitoring

### Caching Strategy
- **Redis** for session storage and API response caching
- **Database query optimization** with TypeORM
- **Connection pooling** for database connections

### Logging
```typescript
// Built-in NestJS logger
import { Logger } from '@nestjs/common';

const logger = new Logger('ModuleName');
logger.log('Info message');
logger.error('Error message');
logger.warn('Warning message');
```

## 🚀 Deployment Best Practices

### Environment Configuration
- Use environment variables for all configuration
- Never commit secrets to version control
- Use different configurations for dev/staging/prod

### Database Migrations
```bash
# Generate migration after entity changes
npm run migration:generate -- -n MigrationName

# Run migrations in production
npm run migration:run
```

### Health Checks
The API includes health check endpoints:
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity check
- `GET /health/redis` - Redis connectivity check

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check connection parameters in .env
# Verify DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD
```

**Redis Connection Issues:**
```bash
# Check if Redis is running
docker compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

**Port Already in Use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 PID
```

**Module Not Found Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📖 Additional Resources

- **[NestJS Documentation](https://docs.nestjs.com/)** - Framework documentation
- **[TypeORM Documentation](https://typeorm.io/)** - ORM documentation
- **[Redis Documentation](https://redis.io/documentation)** - Caching documentation
- **[PostgreSQL Documentation](https://www.postgresql.org/docs/)** - Database documentation
- **[TCGdx API](https://tcgdx.net/)** - Pokémon card data API

### Code Standards
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Maintain test coverage above 80%
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.
