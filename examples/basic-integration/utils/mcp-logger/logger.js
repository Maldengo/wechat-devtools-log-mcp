/**
 * Core MCP Logger Implementation
 * Handles log streaming to MCP server with retry logic and fallback
 */

let config = {
  endpoint: 'http://127.0.0.1:3001/log',
  enabled: false,
  maxRetries: 3,
  timeout: 5000,
  fallbackStorageKey: 'mcp_fallback_logs',
  maxFallbackLogs: 100
};

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};

// WeChat real-time log manager
const logManager = (typeof wx !== 'undefined' && wx.getRealtimeLogManager) 
  ? wx.getRealtimeLogManager() 
  : null;

/**
 * Initialize MCP logger
 */
function init(options) {
  if (options === void 0) options = {};
  
  config = Object.assign({}, config, options);
  
  if (!config.enabled) {
    return;
  }
  
  // Override console methods
  overrideConsoleMethods();
  
  // Setup global error handler
  setupGlobalErrorHandler();
  
  originalConsole.log('✅ MCP Logger initialized:', config.endpoint);
}

/**
 * Override console methods for automatic logging
 */
function overrideConsoleMethods() {
  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    originalConsole.log.apply(console, args);
    if (logManager) logManager.info.apply(logManager, args);
    sendToMCP('log', { arguments: args });
  };
  
  console.info = function() {
    var args = Array.prototype.slice.call(arguments);
    originalConsole.info.apply(console, args);
    if (logManager) logManager.info.apply(logManager, args);
    sendToMCP('info', { arguments: args });
  };
  
  console.warn = function() {
    var args = Array.prototype.slice.call(arguments);
    originalConsole.warn.apply(console, args);
    if (logManager) logManager.warn.apply(logManager, args);
    sendToMCP('warn', { arguments: args });
  };
  
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    originalConsole.error.apply(console, args);
    if (logManager) logManager.error.apply(logManager, args);
    sendToMCP('error', { arguments: args });
  };
}

/**
 * Setup global error handler
 */
function setupGlobalErrorHandler() {
  if (typeof wx !== 'undefined' && wx.onError) {
    wx.onError(function(error) {
      originalConsole.error('Global error:', error);
      
      // Send to WeChat analytics if available
      if (wx.reportAnalytics) {
        wx.reportAnalytics('error', {
          message: error.message,
          stack: error.stack
        });
      }
      
      sendToMCP('error', {
        message: error.message,
        stack: error.stack,
        type: 'global_error'
      });
    });
  }
}

/**
 * Send log to MCP server
 */
function sendToMCP(level, data) {
  if (!config.enabled) return;
  
  var logEntry = Object.assign({
    level: level,
    timestamp: Date.now(),
    source: 'wechat-miniapp'
  }, data);
  
  sendWithRetry(logEntry, 0);
}

/**
 * Send with retry logic and exponential backoff
 */
function sendWithRetry(logEntry, retryCount) {
  if (!config.enabled) return;
  
  var retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
  
  if (typeof wx === 'undefined' || !wx.request) {
    originalConsole.error('WeChat API not available');
    return;
  }
  
  wx.request({
    url: config.endpoint,
    method: 'POST',
    data: logEntry,
    timeout: config.timeout,
    success: function(res) {
      // Reset failure count on success
      if (sendToMCP._failCount > 0) {
        sendToMCP._failCount = 0;
      }
      // Log successful recovery if we had failures before
      if (retryCount > 0) {
        originalConsole.error('[MCP-SUCCESS] Log server connection restored on attempt ' + (retryCount + 1));
      }
    },
    fail: function(err) {
      var isTimeout = err.errMsg && err.errMsg.indexOf('timeout') !== -1;
      var isNetworkError = err.errMsg && (err.errMsg.indexOf('fail') !== -1 || err.errMsg.indexOf('network') !== -1);
      
      // Enhanced error categorization
      if (!sendToMCP._failCount) sendToMCP._failCount = 0;
      
      if (retryCount < config.maxRetries) {
        // Retry with exponential backoff
        setTimeout(function() {
          originalConsole.error('[MCP-RETRY] Retrying log send (attempt ' + (retryCount + 2) + '/' + (config.maxRetries + 1) + ') after ' + retryDelay + 'ms delay. Error: ' + err.errMsg);
          sendWithRetry(logEntry, retryCount + 1);
        }, retryDelay);
      } else {
        // All retries exhausted - use fallback
        fallbackToLocalStorage(logEntry);
        
        // Categorized error reporting (only log first 3 times to avoid spam)
        if (sendToMCP._failCount < 3) {
          if (isTimeout) {
            originalConsole.error('[MCP-TIMEOUT] Log server timeout after ' + (config.maxRetries + 1) + ' attempts. Using fallback storage.');
          } else if (isNetworkError) {
            originalConsole.error('[MCP-NETWORK] Network error after ' + (config.maxRetries + 1) + ' attempts: ' + err.errMsg);
          } else {
            originalConsole.error('[MCP-FAIL] Log server error after ' + (config.maxRetries + 1) + ' attempts: ' + err.errMsg);
          }
          sendToMCP._failCount++;
        } else if (sendToMCP._failCount === 3) {
          originalConsole.error('[MCP-DEGRADED] Log server persistently unreachable - operating in fallback mode');
          sendToMCP._failCount++;
        }
      }
    }
  });
}

/**
 * Fallback to local storage when server unavailable
 */
function fallbackToLocalStorage(logEntry) {
  if (!config.enabled) return;
  
  if (typeof wx === 'undefined' || !wx.getStorage) {
    originalConsole.error('WeChat storage API not available');
    return;
  }
  
  try {
    wx.getStorage({
      key: config.fallbackStorageKey,
      complete: function(res) {
        var logs = [];
        
        // Parse existing logs or start fresh
        if (res.data && res.errMsg === 'getStorage:ok') {
          try {
            logs = JSON.parse(res.data);
            if (!Array.isArray(logs)) logs = [];
          } catch (e) {
            logs = [];
          }
        }
        
        // Add new log entry
        logs.push(logEntry);
        
        // Implement log rotation to prevent storage overflow
        if (logs.length > config.maxFallbackLogs) {
          logs = logs.slice(-config.maxFallbackLogs);
        }
        
        // Store updated logs
        wx.setStorage({
          key: config.fallbackStorageKey,
          data: JSON.stringify(logs),
          success: function() {
            // Silent success - fallback working
            if (sendToMCP._fallbackCount === undefined) sendToMCP._fallbackCount = 0;
            sendToMCP._fallbackCount++;
          },
          fail: function(storageErr) {
            originalConsole.error('[MCP-FALLBACK-FAIL] Local storage also failed:', storageErr);
          }
        });
      }
    });
  } catch (e) {
    originalConsole.error('[MCP-FALLBACK-ERROR] Fallback storage mechanism failed:', e);
  }
}

module.exports = {
  init: init,
  sendToMCP: sendToMCP,
  originalConsole: originalConsole
};
