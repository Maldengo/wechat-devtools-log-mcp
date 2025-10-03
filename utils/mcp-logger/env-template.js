/**
 * Environment Configuration Template
 * Copy this to your WeChat mini-app's utils/env.js
 * 
 * This file should be at: your-wechat-app/utils/env.js
 */

var environments = {
  // Development environment
  development: {
    API_BASE_URL: 'http://127.0.0.1:3000',
    DEBUG: true,                    // Required for MCP logging
    LOG_LEVEL: 'debug',
    MCP_LOGGING: true,              // Enable MCP integration
    MCP_LOG_ENDPOINT: 'http://127.0.0.1:3001/log'
  },
  // Production environment
  production: {
    API_BASE_URL: 'https://your-api.com',
    DEBUG: false,                   // MCP logging disabled
    LOG_LEVEL: 'info',
    MCP_LOGGING: false
  }
};

// Change this to 'production' when deploying
var CURRENT_ENV = 'development';

module.exports = environments[CURRENT_ENV];
