import nats from 'nats';
import { logger } from '../logger/index.js';

const { connect } = nats;

/**
 * Creates a NATS connection with default configuration
 * @param {Object} options - Connection options
 * @param {string} options.servers - NATS server URL (default: 'nats://localhost:4222')
 * @returns {Promise} Connected NATS connection
 */
export async function createNatsConnection(options = {}) {
  const servers = options.servers || process.env.NATS_SERVERS || 'nats://localhost:4222';
  
  try {
    const nc = await connect({ 
      servers,
      reconnect: true,
      maxReconnectAttempts: -1, // Infinite reconnects
      reconnectTimeWait: 2000
    });
    
    logger.info({ servers }, 'NATS connection established');
    
    // Handle connection events
    nc.closed().then(() => {
      logger.info('NATS connection closed');
    });
    
    return nc;
  } catch (error) {
    logger.error({ error, servers }, 'Failed to connect to NATS');
    throw error;
  }
}

/**
 * Publishes a message to a NATS subject
 * @param {NatsConnection} nc - NATS connection
 * @param {string} subject - Subject to publish to
 * @param {Object} data - Data to publish (will be JSON stringified)
 * @param {Object} options - Publish options
 */
export async function publishMessage(nc, subject, data, options = {}) {
  try {
    const payload = JSON.stringify(data);
    nc.publish(subject, payload, options);
    logger.debug({ subject, payload }, 'Message published');
  } catch (error) {
    logger.error({ error, subject }, 'Failed to publish message');
    throw error;
  }
}

/**
 * Subscribes to a NATS subject and handles messages
 * @param {NatsConnection} nc - NATS connection
 * @param {string} subject - Subject to subscribe to
 * @param {Function} handler - Message handler function (receives parsed data)
 * @param {Object} options - Subscribe options
 * @returns {Promise<void>}
 */
export async function subscribeToSubject(nc, subject, handler, options = {}) {
  try {
    const sub = nc.subscribe(subject, options);
    
    logger.info({ subject }, 'Subscribed to subject');
    
    (async () => {
      for await (const msg of sub) {
        try {
          const data = JSON.parse(msg.data);
          logger.debug({ subject, data }, 'Message received');
          await handler(data, msg);
        } catch (error) {
          logger.error({ error, subject }, 'Error handling message');
        }
      }
    })();
    
    return sub;
  } catch (error) {
    logger.error({ error, subject }, 'Failed to subscribe to subject');
    throw error;
  }
}

/**
 * Request-reply pattern: sends a request and waits for a response
 * @param {NatsConnection} nc - NATS connection
 * @param {string} subject - Subject to send request to
 * @param {Object} data - Request data
 * @param {Object} options - Request options (timeout, etc.)
 * @returns {Promise<Object>} Response data
 */
export async function requestReply(nc, subject, data, options = {}) {
  try {
    const timeout = options.timeout || 5000;
    const payload = JSON.stringify(data);
    
    const response = await nc.request(subject, payload, {
      timeout,
      ...options
    });
    
    const responseData = JSON.parse(response.data);
    logger.debug({ subject, responseData }, 'Request-reply completed');
    return responseData;
  } catch (error) {
    logger.error({ error, subject }, 'Request-reply failed');
    throw error;
  }
}

