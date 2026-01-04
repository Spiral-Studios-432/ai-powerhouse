import { createNatsConnection, subscribeToSubject, publishMessage } from '../../../shared/mq/index.js';
import { logger } from '../../../shared/logger/index.js';
import puppeteer from 'puppeteer';

let browser = null;

/**
 * Initialize Puppeteer browser
 */
async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    logger.info('Puppeteer browser launched');
  }
  return browser;
}

/**
 * Scrape financial data for a given ticker
 * @param {string} ticker - Stock ticker symbol (e.g., 'AAPL')
 * @returns {Promise<Object>} Scraped financial data
 */
async function scrapeFinancialData(ticker) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  try {
    logger.info({ ticker }, 'Starting financial data scrape');
    
    // Navigate to Yahoo Finance (example - adjust URL as needed)
    const url = `https://finance.yahoo.com/quote/${ticker}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for key elements to load
    await page.waitForSelector('[data-testid="quote-header"]', { timeout: 10000 }).catch(() => {
      logger.warn({ ticker }, 'Quote header not found, continuing anyway');
    });
    
    // Extract financial data
    const data = await page.evaluate((symbol) => {
      const getText = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
      };
      
      return {
        ticker: symbol,
        timestamp: new Date().toISOString(),
        price: getText('[data-field="regularMarketPrice"]') || getText('fin-streamer[data-field="regularMarketPrice"]'),
        change: getText('[data-field="regularMarketChange"]') || getText('fin-streamer[data-field="regularMarketChange"]'),
        changePercent: getText('[data-field="regularMarketChangePercent"]') || getText('fin-streamer[data-field="regularMarketChangePercent"]'),
        marketCap: getText('[data-testid="MARKET_CAP-value"]'),
        volume: getText('[data-testid="TD_VOLUME-value"]'),
        peRatio: getText('[data-testid="PE_RATIO-value"]'),
        // Add more fields as needed
      };
    }, ticker);
    
    logger.info({ ticker, data }, 'Financial data scraped successfully');
    return data;
    
  } catch (error) {
    logger.error({ error, ticker }, 'Error scraping financial data');
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * Handle crawl request messages
 * @param {Object} data - Message data containing ticker
 * @param {Object} msg - NATS message object
 */
async function handleCrawlRequest(data, msg) {
  const { ticker, requestId } = data;
  
  if (!ticker) {
    logger.warn({ data }, 'Crawl request missing ticker');
    await publishMessage(nc, 'crawl.error', {
      requestId,
      error: 'Missing ticker in request',
      originalData: data
    });
    return;
  }
  
  try {
    logger.info({ ticker, requestId }, 'Processing crawl request');
    
    // Scrape the financial data
    const scrapedData = await scrapeFinancialData(ticker);
    
    // Publish success response
    await publishMessage(nc, 'crawl.res', {
      requestId,
      ticker,
      success: true,
      data: scrapedData,
      timestamp: new Date().toISOString()
    });
    
    logger.info({ ticker, requestId }, 'Crawl request completed successfully');
    
  } catch (error) {
    logger.error({ error, ticker, requestId }, 'Crawl request failed');
    
    // Publish error response
    await publishMessage(nc, 'crawl.error', {
      requestId,
      ticker,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Main execution
let nc = null;

(async () => {
  try {
    // Connect to NATS
    nc = await createNatsConnection();
    logger.info('Crawler agent connected to NATS');
    
    // Subscribe to crawl requests
    await subscribeToSubject(nc, 'crawl.req', handleCrawlRequest);
    logger.info('Crawler agent ready, listening for crawl requests');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Shutting down crawler agent...');
      if (browser) {
        await browser.close();
        logger.info('Browser closed');
      }
      if (nc) {
        await nc.close();
        logger.info('NATS connection closed');
      }
      process.exit(0);
    });
    
  } catch (error) {
    logger.error({ error }, 'Failed to start crawler agent');
    process.exit(1);
  }
})();

