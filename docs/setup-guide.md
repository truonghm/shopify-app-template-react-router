# Setup Guide

This guide covers the fastest way to run the template locally using Docker Compose.

## Prerequisites

- Node.js 20+
- pnpm package manager
- PostgreSQL database
- Redis server
- Shopify Partner account

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:

```env
# Shopify App Configuration
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,write_customers,write_draft_orders
SHOPIFY_APP_URL=https://your-app-url.com

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/shopify_app_dev?schema=public

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### 3. Start required services (Docker Compose)

```bash
# Start PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down
```

Need pgAdmin or Redis Commander? Use the full compose file:

```bash
docker compose up -d
```

### 4. Initialize database

Run the setup script to generate Prisma client and apply migrations:

```bash
pnpm run setup
```

This command will:
- Generate the Prisma client
- Create the database schema
- Apply all migrations

### 5. Start the app

```bash
pnpm run dev
# or
shopify app dev
```

The Shopify CLI will:
- Start the development server
- Provide a tunnel URL for testing
- Set up environment variables automatically

### 6. Start background workers (optional)

In a separate terminal, start the queue workers:

```bash
# Start the email worker
node --loader tsx app/workers/email.worker.ts
```

Tip: use a process manager if you want the worker to run continuously.

## Features configuration

### App Proxy

To enable the app proxy feature:

1. Go to your app settings in the Partner Dashboard
2. Navigate to "App setup" → "App proxy"
3. Configure:
   - Subpath prefix: `apps`
   - Subpath: `your-app-name`
   - Proxy URL: `https://your-app-url.com/proxy`

Requests to `https://yourstore.myshopify.com/apps/your-app-name/*` will be proxied to your app with HMAC validation.

### Webhooks
- App webhooks are configured in `shopify.app.toml`.
- GDPR webhooks must be registered in the Partner Dashboard:
  - `https://your-app-url.com/webhooks/customers/data_request`
  - `https://your-app-url.com/webhooks/customers/redact`
  - `https://your-app-url.com/webhooks/shop/redact`

### Queue system
Queues live under `app/queues/*` and workers under `app/workers/*`. The template includes a sample email queue and worker.

### Logging

The app uses Winston for centralized logging.

#### Log files

In production, logs are written to:
- `logs/app.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Unhandled exceptions
- `logs/rejections.log` - Unhandled promise rejections

## Production notes

Run migrations in production with `pnpm prisma migrate deploy`, and ensure `./logs` exists if file logging is enabled.

## Troubleshooting

### Database connection issues

```bash
# Test connection
pnpm prisma db push

# Reset database (development only!)
pnpm prisma migrate reset
```

### Redis connection issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### Queue issues

Check if Redis is running and the `REDIS_URL` is correct in your `.env` file.

### Webhook issues

1. Verify webhook URLs are publicly accessible
2. Check webhook signatures are being validated
3. Review webhook logs in Partner Dashboard

## Next steps
- Add your business logic to routes and webhooks
- Replace the sample email worker with a real provider
- Add monitoring and CI as needed
