# AI-Powerhouse

Orchestration and coordination layer for the MAA (Master Autonomous Agent) system. A microservices-based AI platform that manages specialized agents using NATS messaging.

## Overview

AI-Powerhouse is the central orchestration component of the MAA ecosystem, responsible for coordinating multiple specialized AI agents that work together to perform financial analysis, data crawling, risk assessment, and automated reporting.

## Architecture

### Components

- **Orchestrator**: Central coordinator that manages agent workflows via NATS messaging
- **Specialized Agents**: Microservices that handle specific tasks:
  - **Crawler**: Web scraping and data collection (Puppeteer)
  - **Parser**: Data extraction and parsing
  - **Anomaly**: Anomaly detection
  - **Efficiency**: Efficiency analysis (efficiencyGPT)
  - **Risk**: Risk assessment
  - **Memory**: State and memory management
  - **Report**: Report generation
  - **Sentinel**: Monitoring and guardrails

- **Shared Utilities**: Common services used across all components:
  - **Logger**: Pino-based structured logging
  - **MQ**: NATS message queue helpers

- **UI**: React frontend for monitoring and control
- **Backend**: Express server with API routes

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Messaging**: NATS (JetStream)
- **Backend**: Express.js
- **Web Scraping**: Puppeteer
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for NATS)

### Installation

```bash
# Install root dependencies
npm install

# Install orchestrator dependencies
cd orchestrator && npm install && cd ..

# Install UI dependencies
cd ui && npm install && cd ..
```

### Development

Start all services concurrently:

```bash
npm run dev
```

Or start individually:

```bash
# Start NATS server
npm run dev:nats

# Start orchestrator (in another terminal)
npm run dev:orchestrator

# Start UI (in another terminal)
npm run dev:ui
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# NATS Configuration
NATS_SERVERS=nats://localhost:4222

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

## Project Structure

```
AI-POWERHOUSE 2/
├── agents/              # Specialized agent microservices
│   ├── crawler/
│   ├── parser/
│   ├── anomaly/
│   ├── efficiency/
│   ├── risk/
│   ├── memory/
│   ├── report/
│   └── sentinel/
├── orchestrator/        # Central coordination service
│   └── src/
│       └── index.js
├── shared/             # Shared utilities
│   ├── logger/         # Pino logger
│   └── mq/             # NATS helpers
├── src/                # Main backend
│   ├── ai/
│   ├── routes/
│   └── utils/
├── ui/                 # React frontend
└── package.json
```

## Usage

The orchestrator publishes tasks to agents via NATS subjects:

```javascript
// Example: Request a crawl
await publishMessage(nc, 'crawl.req', { ticker: 'AAPL' });
```

Agents subscribe to their respective subjects and publish results:

```javascript
// Example: Agent subscribes to requests
await subscribeToSubject(nc, 'crawl.req', async (data) => {
  // Process crawl request
  const result = await crawl(data.ticker);
  await publishMessage(nc, 'crawl.res', result);
});
```

## License

ISC

## Related Projects

Part of the MAA (Master Autonomous Agent) ecosystem.

