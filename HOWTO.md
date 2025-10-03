# HOWTO: Setup and Use wechat-devtools-log-mcp

Complete guide for integrating MCP log streaming into your WeChat Mini-App development workflow.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Frontend Integration](#frontend-integration)
4. [Environment Configuration](#environment-configuration)
5. [Starting MCP Services](#starting-mcp-services)
6. [LLM Agent Configuration](#llm-agent-configuration)
7. [Verification & Testing](#verification--testing)
8. [Advanced Usage](#advanced-usage)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v14 or higher
- **Python** 3.8 or higher
- **WeChat DevTools** installed
- **LLM Agent** (Cursor, Claude Code, or other MCP-compatible IDE)
- **Git** for cloning the repository
- **Terminal** access (bash, zsh, or Git Bash on Windows)

### Check Your Environment

```bash
# Check Node.js version
node --version
# Should show v14.0.0 or higher

# Check Python version
python3 --version
# Should show 3.8.0 or higher

# Check WeChat DevTools installation
# macOS: /Applications/WeChat DevTools.app
# Windows: C:\Program Files\Tencent\WeChat DevTools
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/wechat-devtools-log-mcp.git
cd wechat-devtools-log-mcp
```

### Step 2: Install Dependencies

```bash
make install
```

This will:
- Install Node.js dependencies (express, body-parser, cors)
- Create Python virtual environment
- Install Python dependencies (watchdog)

**Expected Output:**
```
📦 Installing dependencies...

Installing Node.js dependencies...
added 105 packages...

Setting up Python virtual environment...
  ✅ Virtual environment created

Installing Python dependencies...
Successfully installed watchdog-6.0.0

✅ Installation complete!
```

**Installation Time**: ~5-10 seconds

### Step 3: Verify Installation

```bash
make status
```

Should show:
```
📊 Service Status:
  • Log Collection Server (port 3001): ❌ Down
  • MCP Server (stdio): ℹ️  On-demand (via LLM agent)
```

This is normal - services aren't started yet.

---

## Frontend Integration

### Step 1: Copy Utility Library

Copy the `mcp-logger` folder to your WeChat Mini-App:

```bash
# Replace with your actual WeChat project path
cp -r utils/mcp-logger/ /path/to/your-wechat-miniapp/utils/
```

**Example:**
```bash
cp -r utils/mcp-logger/ ~/Projects/my-wechat-app/utils/
```

### Step 2: Integrate into app.js

Add **one line** at the top of your WeChat Mini-App's `app.js`:

```javascript
// At the very top of app.js, before App({})
require('./utils/mcp-logger/index.js');

App({
  onLaunch: function() {
    // Your existing app code
    console.log('App launched'); // This will now stream to MCP!
  },
  
  // ... rest of your app
});
```

**That's it!** The MCP logger will auto-initialize when your app starts.

### Step 3: Verify Integration

Open WeChat DevTools and load your mini-app. Check the console:

**Expected Messages:**
```
📝 MCP Logger: No env.js found, using defaults
🚀 MCP Logger: Initializing in development mode
✅ MCP Logger initialized: http://127.0.0.1:3001/log
```

If you see these messages, the utility library is integrated correctly!

---

## Environment Configuration

### Option 1: Use Default Configuration (Recommended)

The MCP logger works with defaults. If you don't have a `utils/env.js` file, it will:
- Auto-detect DEBUG mode from defaults
- Use endpoint: `http://127.0.0.1:3001/log`
- Enable logging automatically

**No configuration needed!**

### Option 2: Create Custom Environment Configuration

If you want more control, create or update `utils/env.js`:

```bash
# If you don't have env.js, copy the template
cp utils/mcp-logger/env-template.js utils/env.js
```

**Edit `utils/env.js`:**

```javascript
var environments = {
  // Development environment
  development: {
    API_BASE_URL: 'http://127.0.0.1:3000',
    DEBUG: true,                    // ⚠️ REQUIRED for MCP logging
    LOG_LEVEL: 'debug',
    MCP_LOGGING: true,              // Enable MCP integration
    MCP_LOG_ENDPOINT: 'http://127.0.0.1:3001/log'
  },
  
  // Production environment
  production: {
    API_BASE_URL: 'https://your-production-api.com',
    DEBUG: false,                   // ⚠️ MCP logging disabled in production
    LOG_LEVEL: 'info',
    MCP_LOGGING: false
  }
};

// ⚠️ IMPORTANT: Set to 'production' before deploying
var CURRENT_ENV = 'development';

module.exports = environments[CURRENT_ENV];
```

### Critical Configuration Points

**For MCP Logging to Work:**
- ✅ `DEBUG: true` - **REQUIRED**
- ✅ `MCP_LOGGING: true` - **REQUIRED** (or omit to default to true)
- ✅ `CURRENT_ENV = 'development'` - **REQUIRED**

**For Production Safety:**
- ✅ `DEBUG: false` - Automatically disables MCP logging
- ✅ `MCP_LOGGING: false` - Explicitly disables
- ✅ `CURRENT_ENV = 'production'` - Switches environment

---

## Starting MCP Services

### Step 1: Start Services

```bash
make start
```

**Expected Output:**
```
🚀 Starting WeChat DevTools Log MCP...

Starting log collection server (port 3001)...
Starting MCP server (stdio)...
  Note: MCP server runs on-demand via LLM agent connection

✅ Services started!

📊 Service Status:
  • Log Collection Server (port 3001): ✅ Running
  • MCP Server (stdio): ℹ️  On-demand (via LLM agent)

🏥 Health Check: ✅ Healthy

Next steps:
  • Open WeChat DevTools and load your mini-app
  • Run 'make config-cursor' to configure Cursor
  • Check logs with 'make logs'
  • Test connection with 'make test'
```

### Step 2: Verify Services Are Running

```bash
make status
```

**Expected:**
```
📊 Service Status:
  • Log Collection Server (port 3001): ✅ Running
  • MCP Server (stdio): ℹ️  On-demand (via LLM agent)

🏥 Health Check: ✅ Healthy
  Uptime: 45.2s
  Requests: 0
  Log file: /path/to/logs/wechat_logs.log
```

### Step 3: Test Connection

```bash
make test
```

This sends a test log and verifies the entire pipeline:

**Expected:**
```
🧪 Testing MCP Connection
=========================

1. Testing log collection server...
   ✅ Log server: Running

2. Sending test log...
   ✅ Test log sent successfully

3. Verifying log file...
   ✅ Log file exists
   📊 File size: 126B
   📊 Line count: 1 logs

✅ Connection test complete!
```

---

## LLM Agent Configuration

### Cursor Configuration

#### Method 1: Automatic (Recommended)

```bash
make config-cursor
```

**Expected Output:**
```
📝 Generating Cursor MCP configuration...

  ✅ Configuration written to: /Users/you/.cursor/mcp-servers.json

📋 Configuration:
{
  "command": "python3",
  "args": ["/path/to/wechat-devtools-log-mcp/server/mcp-server.py"],
  "env": {
    "WECHAT_LOG_PATH": "/path/to/logs/wechat_logs.log"
  }
}

✅ Cursor MCP configuration complete!

Next steps:
  1. Restart Cursor to apply changes
  2. Start MCP services: make start
  3. Open your WeChat project in Cursor
  4. Use MCP tools in Cursor chat
```

#### Method 2: Manual

Edit `~/.cursor/mcp-servers.json`:

```json
{
  "mcpServers": {
    "wechat-devtools-log-mcp": {
      "command": "python3",
      "args": [
        "/absolute/path/to/wechat-devtools-log-mcp/server/mcp-server.py"
      ],
      "env": {
        "WECHAT_LOG_PATH": "/absolute/path/to/wechat-devtools-log-mcp/logs/wechat_logs.log"
      }
    }
  }
}
```

**Important**: Replace `/absolute/path/to/` with your actual project path.

#### Step 2: Restart Cursor

1. Completely quit Cursor (Cmd+Q on macOS)
2. Reopen Cursor
3. MCP server will auto-connect

#### Step 3: Verify in Cursor

In Cursor's chat, the MCP tools should now be available:
- `get_recent_logs` - Get recent WeChat logs
- `search_logs` - Search logs by text
- `get_error_summary` - Summarize errors
- `health_check` - Check system health

### Claude Code Configuration

#### Method 1: Automatic (Recommended)

```bash
make config-claude
```

Follow the same steps as Cursor configuration.

#### Method 2: Manual

Edit `~/.claude-code/mcp-servers.json` with the same structure as Cursor.

---

## Verification & Testing

### Test 1: Verify Frontend Integration

Open WeChat DevTools and check the console:

**Expected Messages:**
```
🚀 MCP Logger: Initializing in development mode
✅ MCP Logger initialized: http://127.0.0.1:3001/log
```

**Test Code:**
```javascript
// In any page or component
console.log('Testing MCP logging');
console.warn('This is a warning');
console.error('This is an error');
```

### Test 2: Verify Logs Are Streaming

```bash
# In terminal, view live logs
make logs
```

You should see logs appearing in real-time as you interact with your WeChat app!

**Example Log Output:**
```json
{"level":"log","arguments":["Testing MCP logging"],"timestamp":1727712000000,"serverTimestamp":1727712000001}
{"level":"warn","arguments":["This is a warning"],"timestamp":1727712001000,"serverTimestamp":1727712001001}
{"level":"error","arguments":["This is an error"],"timestamp":1727712002000,"serverTimestamp":1727712002001}
```

### Test 3: Verify LLM Agent Integration

In Cursor or Claude Code:

**Try these commands:**
```
Get the last 10 logs from my WeChat app
```

**Cursor should:**
1. Call the `get_recent_logs` tool
2. Retrieve logs from the MCP server
3. Display them in the chat
4. Offer AI-powered analysis and suggestions

### Test 4: Test Production Mode

**Edit `utils/env.js`:**
```javascript
var CURRENT_ENV = 'production'; // Changed from 'development'
```

**Reload WeChat app in DevTools**

**Expected:**
```
⚠️  MCP Logger: Disabled (not in development mode)
```

No logs will be sent to MCP server. Zero overhead! ✅

**Don't forget to change back to 'development' for continued testing!**

---

## Advanced Usage

### Custom Log Endpoint

If you need a different endpoint:

```javascript
// In utils/env.js
development: {
  DEBUG: true,
  MCP_LOG_ENDPOINT: 'http://192.168.1.100:3001/log' // Custom IP
}
```

### Manual Logging

Send custom structured logs:

```javascript
var logger = require('./utils/mcp-logger/index.js');

// Send custom log
logger.sendToMCP('custom', {
  event: 'user_action',
  action: 'button_click',
  component: 'calendar',
  timestamp: Date.now()
});
```

### Custom Configuration

Initialize logger with custom settings:

```javascript
var logger = require('./utils/mcp-logger/logger.js');

logger.init({
  endpoint: 'http://127.0.0.1:3001/log',
  enabled: true,
  maxRetries: 5,              // More retries
  timeout: 10000,             // Longer timeout
  maxFallbackLogs: 200        // More fallback logs
});
```

### Viewing Fallback Logs

When the MCP server is unavailable, logs are stored locally:

```javascript
// In WeChat DevTools console
wx.getStorage({
  key: 'mcp_fallback_logs',
  success: (res) => {
    console.log('Fallback logs:', JSON.parse(res.data));
  }
});
```

### Filter Logs by Level in Cursor

In Cursor chat:
```
Get ERROR level logs from the last hour
```

```
Search for "API" in recent WARN logs
```

### Using MCP Prompts

In Cursor chat:
```
Run the analyze_logs prompt
```

This will automatically:
1. Fetch recent WARN+ logs
2. Analyze for patterns
3. Suggest debugging steps

---

## Troubleshooting

### Issue 1: Logs Not Appearing in Console

**Symptoms:**
- No MCP logger initialization messages
- No logs in WeChat DevTools console

**Diagnosis:**
```bash
# Check if mcp-logger folder was copied
ls your-wechat-app/utils/mcp-logger/
# Should show: index.js, logger.js, config.js, etc.

# Check if require() was added to app.js
grep "mcp-logger" your-wechat-app/app.js
# Should show: require('./utils/mcp-logger/index.js');
```

**Solutions:**
1. Verify you copied the entire `utils/mcp-logger/` folder
2. Check `require('./utils/mcp-logger/index.js')` is at the top of app.js
3. Reload your mini-app in WeChat DevTools

### Issue 2: "MCP Logger: Disabled (not in development mode)"

**Symptoms:**
- MCP logger shows disabled message
- No logs streaming

**Cause:**
- `DEBUG: false` in your environment configuration
- `MCP_LOGGING: false` explicitly set
- `CURRENT_ENV = 'production'`

**Solutions:**
1. Check `utils/env.js` (if it exists)
2. Ensure `DEBUG: true`
3. Ensure `CURRENT_ENV = 'development'`
4. Reload mini-app in WeChat DevTools

### Issue 3: Log Server Not Running

**Symptoms:**
- `make status` shows "❌ Down"
- Logs show retry messages in WeChat console

**Diagnosis:**
```bash
# Check if services are running
make status

# Check server logs
cat logs/server.log
```

**Solutions:**
```bash
# Start services
make start

# If already started, restart
make restart

# Check for port conflicts
lsof -i :3001
```

### Issue 4: Port 3001 Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use 127.0.0.1:3001
```

**Solutions:**

**Option 1: Kill the conflicting process**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID)
kill <PID>

# Restart services
make restart
```

**Option 2: Use a different port**
```bash
# Start with custom port
PORT=3002 node server/log-collector.js &

# Update env.js
MCP_LOG_ENDPOINT: 'http://127.0.0.1:3002/log'
```

### Issue 5: Logs Showing Retry/Error Messages

**Symptoms:**
```
[MCP-RETRY] Retrying log send (attempt 2/4)...
[MCP-TIMEOUT] Log server timeout after 4 attempts
```

**Cause:** MCP services not running

**Solution:**
```bash
# Check service status
make status

# Start services if down
make start

# Logs should stop retrying once server is up
```

### Issue 6: Cursor Not Showing MCP Tools

**Symptoms:**
- No wechat-devtools-log-mcp tools in Cursor
- MCP connection error messages

**Diagnosis:**
```bash
# Check Cursor configuration
cat ~/.cursor/mcp-servers.json
```

**Solutions:**
1. Run `make config-cursor` again
2. Verify absolute paths are correct
3. Ensure `server/mcp-server.py` exists
4. **Completely restart Cursor** (not just reload)
5. Check Cursor's MCP server status in settings

### Issue 7: "Log file not found" in MCP Tools

**Symptoms:**
- MCP tools return "Log file not found"
- health_check shows log file status: not_found

**Cause:** No logs have been sent yet

**Solutions:**
1. Open WeChat DevTools and load your mini-app
2. Trigger some console.log() calls
3. Wait a few seconds
4. Try MCP tools again

**Quick Test:**
```javascript
// In WeChat DevTools console
console.log('Test log from DevTools');
```

### Issue 8: Production Mode Not Disabling Logger

**Symptoms:**
- Logs still streaming in production
- Performance impact in production

**Diagnosis:**
```javascript
// Check env.js
var CURRENT_ENV = 'development'; // Should be 'production'
```

**Solution:**
1. Set `CURRENT_ENV = 'production'` in `utils/env.js`
2. OR set `DEBUG: false` in production environment
3. Rebuild and redeploy mini-app
4. Verify no MCP logger messages in console

### Issue 9: "Permission denied" Errors

**Symptoms:**
- Cannot write to log file
- File system errors

**Solutions:**
```bash
# Check permissions
ls -la logs/

# Fix permissions
chmod 755 logs/
chmod 644 logs/*.log

# Recreate logs directory
rm -rf logs/
mkdir logs
make start
```

### Issue 10: Python Virtual Environment Issues

**Symptoms:**
- `make install` fails
- Python dependencies not found

**Solutions:**
```bash
# Remove and recreate venv
rm -rf venv/
make install

# Or manually create venv
python3 -m venv venv
./venv/bin/pip install -r server/requirements.txt
```

---

## FAQ

### Q1: Do I need to modify my WeChat app code?

**A:** Just add one line: `require('./utils/mcp-logger/index.js')` at the top of app.js. All console.log/info/warn/error calls are automatically captured!

### Q2: Will this affect my production builds?

**A:** No! When `DEBUG: false`, the MCP logger is a complete no-op with **zero overhead**. No network calls, no performance impact.

### Q3: What happens if the MCP server is down?

**A:** The logger has automatic retry logic (3 attempts with exponential backoff) and falls back to WeChat local storage. Your app continues working normally!

### Q4: Can I use this with multiple WeChat projects?

**A:** Yes! Copy the `utils/mcp-logger/` folder to each project. All projects can stream to the same MCP server.

### Q5: How much data does the logger send?

**A:** Only in development mode. Each log is a small JSON object (~100-200 bytes). Very minimal network usage.

### Q6: Can I customize the log format?

**A:** Yes! You can modify `utils/mcp-logger/logger.js` in your project. The code is simple and well-documented.

### Q7: Does this work with WeChat games?

**A:** Yes! The same integration works for both WeChat Mini-Apps and WeChat Mini-Games.

### Q8: How do I update to a new version?

**A:** 
```bash
# Pull latest changes
git pull

# Reinstall dependencies
make install

# Recopy utility library to your WeChat apps
cp -r utils/mcp-logger/ /path/to/your-wechat-app/utils/

# Restart services
make restart
```

### Q9: Can I use this with Windows?

**A:** Yes, but requires Git Bash. Most commands work, but some may need adjustment. Windows support is experimental.

### Q10: How do I uninstall?

**A:**
```bash
# Stop services
make stop

# Remove from WeChat app
rm -rf your-wechat-app/utils/mcp-logger/
# Remove require() line from app.js

# Remove Cursor config
# Edit ~/.cursor/mcp-servers.json and remove wechat-devtools-log-mcp entry

# Optionally remove the tool
rm -rf wechat-devtools-log-mcp/
```

---

## Daily Development Workflow

### Morning Routine

```bash
# 1. Start MCP services
cd wechat-devtools-log-mcp
make start

# 2. Open WeChat DevTools
# Load your mini-app

# 3. Open Cursor
# MCP tools automatically available
```

### During Development

```javascript
// Your code automatically logs to MCP
console.log('User clicked button');
console.error('API call failed:', error);

// Use Cursor chat for debugging
// "Show me recent ERROR logs"
// "Search for 'API call' in logs"
// "Analyze my recent errors"
```

### End of Day

```bash
# Stop services to save resources
make stop
```

---

## Best Practices

### 1. Environment Management

✅ **DO:**
- Keep `DEBUG: true` in development
- Set `DEBUG: false` in production
- Use environment switching (development/production)

❌ **DON'T:**
- Deploy with `DEBUG: true`
- Hardcode endpoints
- Commit env.js with production secrets

### 2. Log Hygiene

✅ **DO:**
- Use appropriate log levels (log, info, warn, error)
- Include context in log messages
- Clean up verbose console.log() before production

❌ **DON'T:**
- Log sensitive data (passwords, tokens)
- Over-log in tight loops
- Leave debug logs in production

### 3. Performance

✅ **DO:**
- Let MCP logger handle batching
- Use async logging (automatic)
- Monitor log file size periodically

❌ **DON'T:**
- Send huge objects in logs
- Log every function call
- Keep logs running if not debugging

### 4. Security

✅ **DO:**
- Keep services localhost-only (127.0.0.1)
- Disable in production (DEBUG: false)
- Review logs before sharing

❌ **DON'T:**
- Expose ports to external network
- Log user passwords or tokens
- Share log files with sensitive data

---

## Advanced Configuration

### Custom Log Levels

```javascript
// Add custom levels to logger
var logger = require('./utils/mcp-logger/logger.js');

logger.sendToMCP('performance', {
  metric: 'page_load_time',
  value: 1250,
  timestamp: Date.now()
});
```

### Conditional Logging

```javascript
// Log only in specific conditions
if (someCondition) {
  console.log('Conditional log', data);
}

// Or use logger directly
if (DEBUG) {
  logger.sendToMCP('debug', { detail: 'verbose info' });
}
```

### Integration with Existing Logging

```javascript
// Combine with WeChat's real-time logger
const logManager = wx.getRealtimeLogManager();

function log(message) {
  console.log(message);           // MCP + console
  logManager.info(message);       // WeChat cloud
}
```

---

## Architecture Deep Dive

### How It Works

```
┌─────────────────────────────────────┐
│  WeChat Mini-App (Your App)        │
│  ┌───────────────────────────────┐ │
│  │ app.js                        │ │
│  │ require('./utils/mcp-logger') │ │
│  └───────────┬───────────────────┘ │
│              │                      │
│  ┌───────────▼───────────────────┐ │
│  │ utils/mcp-logger/             │ │
│  │ • Overrides console.*         │ │
│  │ • Sends via wx.request()      │ │
│  │ • Retry logic + fallback      │ │
│  └───────────┬───────────────────┘ │
└──────────────┼──────────────────────┘
               │ HTTP POST
               │
┌──────────────▼──────────────────────┐
│  Log Collection Server              │
│  • Express.js on port 3001          │
│  • Receives POST /log               │
│  • Appends to wechat_logs.log       │
│  • Health endpoint /health          │
└──────────────┬──────────────────────┘
               │ File I/O
               │
┌──────────────▼──────────────────────┐
│  logs/wechat_logs.log               │
│  • One JSON object per line         │
│  • Timestamps, levels, messages     │
└──────────────┬──────────────────────┘
               │ File Read
               │
┌──────────────▼──────────────────────┐
│  MCP Server (Python)                │
│  • stdio protocol (JSON-RPC 2.0)    │
│  • Tools: get_recent_logs, search   │
│  • Prompts: analyze, debug session  │
└──────────────┬──────────────────────┘
               │ MCP Protocol
               │
┌──────────────▼──────────────────────┐
│  LLM Agent (Cursor/Claude Code)     │
│  • Connects via MCP                 │
│  • Queries logs with tools          │
│  • AI-powered analysis              │
└─────────────────────────────────────┘
```

### Component Responsibilities

**Frontend (utils/mcp-logger/)**:
- Console method override
- HTTP POST to log server
- Retry logic with exponential backoff
- Fallback to local storage
- Global error handling
- Production safety checks

**Log Collection Server (Node.js)**:
- Accept HTTP POST requests
- Append to log file
- Health monitoring
- CORS for WeChat requests

**MCP Server (Python)**:
- MCP protocol implementation
- Log file reading and parsing
- Tool implementations
- Prompt templates
- Health checks

**LLM Agent (Cursor/Claude)**:
- MCP client
- Tool execution
- AI-powered analysis
- Developer interaction

---

## Performance Tuning

### For High-Volume Logging

If you have many logs:

```javascript
// In logger.js, customize retry strategy
maxRetries: 1,              // Fewer retries
timeout: 2000,              // Shorter timeout
maxFallbackLogs: 50         // Smaller fallback buffer
```

### For Low Latency

```javascript
// Reduce delays
timeout: 1000,              // 1 second timeout
maxRetries: 1               // Quick fail to fallback
```

### Log File Rotation

```bash
# Manually rotate logs
mv logs/wechat_logs.log logs/wechat_logs.log.old
touch logs/wechat_logs.log

# Or use logrotate (Linux/macOS)
# See: man logrotate
```

---

## Security Considerations

### Development vs Production

**Development (DEBUG: true)**:
- ✅ MCP logging enabled
- ✅ Localhost only (127.0.0.1)
- ✅ No external exposure
- ✅ Local file storage

**Production (DEBUG: false)**:
- ✅ MCP logging completely disabled
- ✅ Zero network calls
- ✅ Zero overhead
- ✅ Safe for deployment

### Data Privacy

**What's Logged:**
- Console messages
- Log levels
- Timestamps
- Stack traces (for errors)

**What's NOT Logged:**
- User passwords
- Auth tokens (unless you log them - don't!)
- Sensitive user data (unless you log it - don't!)

**Best Practice:** Review your console.log() calls before production to ensure no sensitive data is logged.

### Network Security

- **Localhost Only**: Services bind to 127.0.0.1
- **No Authentication**: Not needed (local-only)
- **No Encryption**: Not needed (local-only)
- **CORS Enabled**: Only for localhost requests

---

## Getting Help

### Documentation
- **README.md** - Quick start guide
- **HOWTO.md** - This comprehensive guide (you are here!)
- **docs/prd.md** - Product requirements and technical details
- **docs/frontend-setup.md** - Frontend integration deep dive
- **docs/troubleshooting.md** - Extended troubleshooting guide
- **docs/api-reference.md** - API documentation

### Community Support
- **GitHub Issues**: https://github.com/your-org/wechat-devtools-log-mcp/issues
- **GitHub Discussions**: https://github.com/your-org/wechat-devtools-log-mcp/discussions
- **Discord**: [Community Discord invite]

### Reporting Bugs

When reporting issues, include:
1. Operating system and version
2. Node.js and Python versions
3. Output of `make status`
4. Relevant error messages
5. Steps to reproduce

---

## Contributing

Want to improve wechat-devtools-log-mcp? See [CONTRIBUTING.md](CONTRIBUTING.md)!

---

## Appendix: Command Reference

### Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies |
| `make start` | Start MCP services |
| `make stop` | Stop all services |
| `make restart` | Restart services |
| `make status` | Check service status |
| `make config-cursor` | Configure Cursor |
| `make config-claude` | Configure Claude Code |
| `make logs` | View live logs |
| `make test` | Test MCP connection |
| `make clean` | Clean up log files |
| `make setup` | Full setup (install + start) |

### Script Usage

```bash
# Config generator
node scripts/config-generator.js --agent cursor
node scripts/config-generator.js --agent claude
node scripts/config-generator.js  # Shows help
```

---

**Last Updated**: 2025-09-30  
**Version**: 1.0  
**For**: wechat-devtools-log-mcp v1.0.0

Need more help? Check the other documentation files or open an issue on GitHub!
