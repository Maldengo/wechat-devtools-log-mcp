# wechat-devtools-log-mcp

> Real-time WeChat DevTools log streaming for LLM agents (Cursor, Claude Code, etc.)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org)

Stream your WeChat Mini-App logs directly to your favorite LLM-powered IDE for AI-assisted debugging!

## 🚀 Quick Start

### 1. Clone this repository
```bash
git clone https://github.com/your-org/wechat-devtools-log-mcp.git
cd wechat-devtools-log-mcp
```

### 2. Install dependencies
```bash
make install
```

### 3. Copy utility library to your WeChat Mini-App
```bash
# Copy the mcp-logger folder to your WeChat project
cp -r utils/mcp-logger/ /path/to/your-wechat-miniapp/utils/
```

### 4. Add one line to your WeChat app.js
```javascript
// At the top of your app.js file
require('./utils/mcp-logger/index.js');

App({
  // ... your existing app code
});
```

### 5. Start MCP services
```bash
make start
```

### 6. Configure your LLM agent
```bash
# For Cursor
make config-cursor

# For Claude Code
make config-claude
```

### 7. Done! 🎉
Open WeChat DevTools, load your mini-app, and watch the logs flow to your LLM agent!

## ✨ Features

- 🔄 **Real-time Log Streaming** - Instant log delivery to LLM agents
- 📋 **Copy-Paste Integration** - Just copy one folder to your project
- 🎯 **Zero Configuration** - Works out of the box
- 🤖 **LLM Agent Ready** - Pre-configured for Cursor, Claude Code
- 🛡️ **Production Safe** - Automatically disabled in production
- ⚡ **Lightweight** - Minimal overhead, async logging
- 🔄 **Network Resilient** - Retry logic and fallback storage
- 📊 **Health Monitoring** - Built-in status checks

## 📖 Usage

### Basic Commands
```bash
make start      # Start MCP services
make stop       # Stop services
make restart    # Restart services
make status     # Check service status
make logs       # View live logs
make test       # Test MCP connection
```

### Configuration Commands
```bash
make config-cursor  # Configure Cursor
make config-claude  # Configure Claude Code
```

## 🔧 How It Works

```
┌─────────────────┐
│ WeChat Mini-App │
│   (Your App)    │
└────────┬────────┘
         │ console.log()
         │ console.error()
         ↓
┌─────────────────┐
│  MCP Logger     │
│  (utils folder) │
└────────┬────────┘
         │ HTTP POST
         ↓
┌─────────────────┐
│  Log Server     │
│  (Port 3001)    │
└────────┬────────┘
         │ File Write
         ↓
┌─────────────────┐
│  MCP Server     │
│  (Port 8765)    │
└────────┬────────┘
         │ MCP Protocol
         ↓
┌─────────────────┐
│  LLM Agent      │
│ Cursor/Claude   │
└─────────────────┘
```

## 🛠️ Troubleshooting

### Logs not appearing?
```bash
# Check service status
make status

# View live logs
make logs

# Test connection
make test
```

### Common Issues

**"Log server not running"**
```bash
make restart
```

**"Permission denied"**
```bash
# Make sure ports 3001 and 8765 are available
lsof -i :3001
lsof -i :8765
```

**"Logs not streaming to Cursor"**
```bash
# Reconfigure Cursor
make config-cursor
# Restart Cursor
```

## 📚 Documentation

- [HOWTO.md](HOWTO.md) - Detailed setup guide
- [docs/prd.md](docs/prd.md) - Product Requirements Document
- [docs/frontend-setup.md](docs/frontend-setup.md) - Frontend integration details
- [docs/troubleshooting.md](docs/troubleshooting.md) - Common issues
- [docs/api-reference.md](docs/api-reference.md) - API documentation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 💬 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/wechat-devtools-log-mcp/issues)
- 💬 [GitHub Discussions](https://github.com/your-org/wechat-devtools-log-mcp/discussions)

---

Made with ❤️ for WeChat Mini-App developers using LLM agents