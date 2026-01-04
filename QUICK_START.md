# Quick Start Guide

## Starting the System

### 1. Start NATS Server
```bash
npm run dev:nats:local
```

### 2. Start Crawler Agent (in another terminal)
```bash
npm run dev:crawler
```

### 3. Start Orchestrator (in another terminal)
```bash
npm run dev:orchestrator
```

### Or Start Everything at Once
```bash
npm run dev
```

## Development Commands

### Individual Services
- `npm run dev:nats` - Start NATS with Docker
- `npm run dev:nats:local` - Start NATS locally (no Docker)
- `npm run dev:orchestrator` - Start orchestrator service
- `npm run dev:crawler` - Start crawler agent
- `npm run dev:ui` - Start React UI

### All Services
- `npm run dev` - Start all services concurrently

## Project Structure

```
AI-POWERHOUSE 2/
├── agents/              # Specialized agent microservices
│   └── crawler/         # Web scraping agent
├── orchestrator/        # Central coordination service
├── shared/              # Shared utilities
│   ├── logger/         # Pino logger
│   └── mq/             # NATS helpers
├── src/                # Main backend
└── ui/                 # React frontend
```

## Message Flow

1. **Orchestrator** publishes: `{ ticker: 'AAPL' }` to `crawl.req`
2. **Crawler** receives message and scrapes Yahoo Finance
3. **Crawler** publishes results to `crawl.res`
4. Logs show the message flow in both services

## Environment Variables

Create a `.env` file in the root directory:

```env
# NATS Configuration
NATS_SERVERS=nats://localhost:4222

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## Troubleshooting

### NATS Not Running
- Check if NATS is running: `lsof -i :4222`
- Start with: `npm run dev:nats:local`

### Module Not Found Errors
- Run `npm install` in root directory
- Run `npm install` in `agents/crawler/` if needed
- Run `npm install` in `orchestrator/` if needed

### Port Already in Use
- NATS uses port 4222
- Make sure no other service is using it

## Git Commands

### Check Status
```bash
git status
```

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Push to GitHub
```bash
git push origin main
```

## Next Steps

- [ ] Implement Parser agent
- [ ] Set up Express server
- [ ] Enhance orchestrator to subscribe to responses
- [ ] Build basic UI dashboard
- [ ] Add more agents (Risk, Efficiency, etc.)

