/**
 * WeChat MCP Logger - Main Entry Point
 * Copy this entire folder to your WeChat mini-app's utils/ directory
 * 
 * Usage:
 * 1. Copy utils/mcp-logger/ to your-wechat-app/utils/
 * 2. Add to app.js: require('./utils/mcp-logger/index.js');
 * 3. That's it! Logging is now enabled in development mode
 */

var config = require('./config.js');
var logger = require('./logger.js');

// Auto-detect environment from your env.js if it exists
var envConfig = {};
try {
  envConfig = require('../env.js') || {};
} catch (e) {
  console.log('📝 MCP Logger: No env.js found, using defaults');
}

// Initialize MCP logging
var IS_DEVELOPMENT = envConfig.DEBUG === true || config.DEBUG === true;
var MCP_ENABLED = IS_DEVELOPMENT && (envConfig.MCP_LOGGING !== false);

if (MCP_ENABLED) {
  console.log('🚀 MCP Logger: Initializing in development mode');
  logger.init({
    endpoint: envConfig.MCP_LOG_ENDPOINT || config.DEFAULT_ENDPOINT,
    enabled: true,
    maxRetries: config.MAX_RETRIES,
    timeout: config.TIMEOUT,
    fallbackStorageKey: config.FALLBACK_STORAGE_KEY,
    maxFallbackLogs: config.MAX_FALLBACK_LOGS
  });
} else {
  console.log('⚠️  MCP Logger: Disabled (not in development mode)');
}

module.exports = logger;
