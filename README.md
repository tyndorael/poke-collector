# Poke Collector

Poke Collector is a full-stack web application for managing and tracking your Pokémon card collection. Built with modern technologies, it provides a comprehensive platform for collectors to organize, search, and manage their Pokémon cards.

## 🎯 Project Purpose

This project serves as a **Proof of Concept (PoC)** designed for learning and experimentation with modern web development technologies. It's an educational endeavor to explore and master the full-stack development process, including:

- Modern backend frameworks (NestJS)
- Frontend development with Next.js 15
- Database design and ORM usage
- Authentication and authorization patterns
- Docker containerization
- API design and documentation
- **GitHub Copilot integration** for AI-assisted development

The project demonstrates practical implementation of these technologies while building a real-world application that Pokemon card collectors might find useful.

## 🚀 Features

- **Card Management**: Browse, search, and organize your Pokémon card collection
- **Collection Tracking**: Create and manage multiple collections
- **Set Management**: Explore different Pokémon card sets
- **Statistics Dashboard**: Track your collection statistics and progress
- **User Authentication**: Secure login and user management
- **Modern UI**: Responsive design with dark/light theme support
- **Real-time Updates**: Live data synchronization with Redis caching

## 🏗️ Tech Stack

### Backend
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Caching and session storage
- **[TypeORM](https://typeorm.io/)** - Database ORM
- **[JWT](https://jwt.io/)** - Authentication
- **[Swagger](https://swagger.io/)** - API documentation
- **[TCGdex SDK](https://tcgdex.net/)** - Pokémon card data

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[SWR](https://swr.vercel.app/)** - Data fetching
- **[Recharts](https://recharts.org/)** - Data visualization

## 📁 Project Structure

```
poke-collector/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── cards/          # Card management
│   │   ├── collections/    # Collection management
│   │   ├── sets/           # Set management
│   │   ├── stats/          # Statistics
│   │   └── users/          # User management
│   └── test/               # E2E tests
├── frontend/               # Next.js Frontend
│   ├── app/                # App router pages
│   ├── components/         # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and configs
│   └── types/             # TypeScript definitions
├── scripts/               # Utility scripts
└── docker-compose.yml     # Docker services
```

## 🚀 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** v18+ (v20+ recommended)
- **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/)**
- **[Docker](https://www.docker.com/)** and **[Docker Compose](https://docs.docker.com/compose/)** (for database services)
- **[Git](https://git-scm.com/)**

### 📋 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tyndorael/poke-collector.git
   cd poke-collector
   ```

2. **Start required services with Docker**
   ```bash
   docker compose up -d postgres redis minio
   ```
   This will start:
   - PostgreSQL database on port `5432`
   - Redis cache on port `6379`
   - MinIO object storage on ports `9000` (API) and `9001` (Console)

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create environment file (adjust values as needed)
   cat > .env << EOF
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
   JWT_SECRET=your-jwt-secret-key-here
   JWT_EXPIRES_IN=7d
   
   # MinIO
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET_NAME=poke-collector
   EOF
   
   # Start the backend in development mode
   npm run start:dev
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create environment file
   cat > .env.local << EOF
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   EOF
   
   # Start the frontend in development mode
   npm run dev
   ```

### 🌐 Access the Application

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **API Documentation**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1) (Swagger UI)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (minioadmin/minioadmin)

### 🔄 Data Synchronization

To populate your database with Pokémon card data:

```bash
cd scripts
chmod +x sync-pokemon-data.sh
./sync-pokemon-data.sh
```

This script will:
- Sync all Pokémon card data (sets and cards) from TCGdex

## 🐳 Docker Deployment

### Full Stack with Docker

1. **Uncomment the backend and frontend services in `docker-compose.yml`**

2. **Create environment files for Docker**
   ```bash
   # Backend .env
   cp backend/.env.example backend/.env
   
   # Frontend .env.local
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Run the full stack**
   ```bash
   docker compose up --build
   ```

### Services will be available at:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO: localhost:9000 (API), localhost:9001 (Console)

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run start:dev    # Start in development mode with hot reload
npm run start:debug  # Start in debug mode
npm run build        # Build for production
npm run start:prod   # Start production build
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

#### Frontend
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run Next.js linter
npm run format       # Format code with Prettier
```

### 🔧 Code Quality

This project follows best practices for code quality:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

### 🧪 Testing

```bash
# Backend tests
cd backend
npm run test        # Unit tests
npm run test:watch  # Watch mode
npm run test:cov    # Coverage report
npm run test:e2e    # E2E tests

# Frontend tests (if configured)
cd frontend
npm run test
```

## 📚 API Documentation

Once the backend is running, visit [http://localhost:3000/api](http://localhost:3000/api) for interactive API documentation powered by Swagger.

### Main API Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/cards` - Get cards with filtering
- `GET /api/v1/sets` - Get card sets
- `GET /api/v1/collections` - Get user collections
- `POST /api/v1/cards/sync-all` - Sync card data

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=poke-collector
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection issues**
   - Ensure PostgreSQL is running: `docker compose ps`
   - Check database credentials in `.env` file

2. **Redis connection issues**
   - Ensure Redis is running: `docker compose ps`
   - Check Redis host and port configuration

3. **Port conflicts**
   - Backend default: 3000
   - Frontend default: 3000 (dev), 3001 (Docker)
   - Database: 5432
   - Redis: 6379

4. **Module not found errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Next.js cache: `rm -rf .next`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TCGdex](https://tcgdx.net/) for providing Pokémon card data
- [Pokémon Company](https://www.pokemon.com/) for the amazing trading card game
- Open source community for the fantastic tools and libraries