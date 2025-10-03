/**
 * Default configuration for MCP Logger
 * These can be overridden by your env.js
 */

module.exports = {
  DEBUG: false,
  DEFAULT_ENDPOINT: 'http://127.0.0.1:3001/log',
  MAX_RETRIES: 3,
  TIMEOUT: 5000,
  FALLBACK_STORAGE_KEY: 'mcp_fallback_logs',
  MAX_FALLBACK_LOGS: 100
};
