import { createNatsConnection, publishMessage } from '../../shared/mq/index.js';
import { logger } from '../../shared/logger/index.js';

const nc = await createNatsConnection();
logger.info('orchestrator connected');
await publishMessage(nc, 'crawl.req', { ticker: 'AAPL' });
