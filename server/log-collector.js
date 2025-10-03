/**
 * WeChat DevTools Log Collection Server
 * Simple Express.js server that receives logs from WeChat Mini-Apps
 * and persists them to file for MCP server consumption
 */

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for requests from the WeChat Mini Program
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Log file path - in logs directory
const logFilePath = path.join(__dirname, '../logs/wechat_logs.log');

// Ensure logs directory exists
const logsDir = path.dirname(logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`✅ Created logs directory: ${logsDir}`);
}

// Health check tracking
let healthStats = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
  lastError: null,
  logFileStatus: 'ok',
  logFileSize: 0
};

/**
 * Root endpoint - API information
 */
app.get('/', (req, res) => {
  res.json({
    name: 'WeChat DevTools Log Collection Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      log: 'POST /log'
    },
    uptime: Date.now() - healthStats.startTime,
    requestCount: healthStats.requestCount
  });
});

/**
 * Health check endpoint
 * Returns detailed status about the server and log file
 */
app.get('/health', (req, res) => {
  // Check if log file is accessible
  fs.access(logFilePath, fs.constants.W_OK, (err) => {
    if (err) {
      healthStats.logFileStatus = 'error';
      healthStats.lastError = err.message;
    } else {
      healthStats.logFileStatus = 'ok';
      
      // Get log file size
      try {
        const stats = fs.statSync(logFilePath);
        healthStats.logFileSize = stats.size;
      } catch (e) {
        // File doesn't exist yet - that's ok
        healthStats.logFileSize = 0;
      }
    }

    const uptime = Date.now() - healthStats.startTime;
    const status = healthStats.logFileStatus === 'ok' ? 'healthy' : 'unhealthy';

    res.status(status === 'healthy' ? 200 : 503).json({
      status: status,
      uptime: uptime,
      requestCount: healthStats.requestCount,
      errorCount: healthStats.errorCount,
      logFileStatus: healthStats.logFileStatus,
      logFilePath: logFilePath,
      logFileSize: healthStats.logFileSize,
      lastError: healthStats.lastError,
      timestamp: new Date().toISOString()
    });
  });
});

/**
 * Log collection endpoint
 * Receives log data from WeChat Mini-Apps and appends to log file
 */
app.post('/log', (req, res) => {
  healthStats.requestCount++;
  
  const logData = req.body;
  
  // Validate log data
  if (!logData || typeof logData !== 'object') {
    healthStats.errorCount++;
    return res.status(400).json({ 
      error: 'Invalid log data',
      message: 'Log data must be a JSON object'
    });
  }
  
  // Add server-side timestamp if not present
  if (!logData.serverTimestamp) {
    logData.serverTimestamp = Date.now();
  }
  
  // Format as single-line JSON for easy parsing
  const logString = `${JSON.stringify(logData)}\n`;

  // Append log to file
  fs.appendFile(logFilePath, logString, (err) => {
    if (err) {
      healthStats.errorCount++;
      healthStats.lastError = err.message;
      console.error('❌ Failed to write to log file:', err);
      return res.status(500).json({
        error: 'Failed to save log',
        message: err.message
      });
    }
    
    // Success - return 200
    res.status(200).json({
      status: 'success',
      message: 'Log received'
    });
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      health: 'GET /health',
      log: 'POST /log',
      root: 'GET /'
    }
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  healthStats.errorCount++;
  healthStats.lastError = err.message;
  console.error('❌ Server error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

/**
 * Start server
 */
app.listen(port, '127.0.0.1', () => {
  console.log('');
  console.log('🚀 WeChat DevTools Log Collection Server');
  console.log('==========================================');
  console.log(`✅ Server listening at http://127.0.0.1:${port}`);
  console.log(`📁 Logs will be saved to: ${logFilePath}`);
  console.log(`🏥 Health check: http://127.0.0.1:${port}/health`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
