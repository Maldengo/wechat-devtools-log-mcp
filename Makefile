# Makefile for wechat-devtools-log-mcp
# Simple commands to manage MCP log services for WeChat Mini-App development
#
# Quick Start:
#   make install   - Install all dependencies
#   make start     - Start MCP services
#   make status    - Check service status
#   make stop      - Stop all services

.PHONY: help install start stop restart status config-cursor config-claude logs test clean setup

# Default target - show help
help:
	@echo "🚀 WeChat DevTools Log MCP"
	@echo "============================"
	@echo ""
	@echo "Quick Start Commands:"
	@echo "  make install        - Install all dependencies (npm + pip)"
	@echo "  make start          - Start MCP log services"
	@echo "  make stop           - Stop all services"
	@echo "  make restart        - Restart services"
	@echo "  make status         - Check service status"
	@echo ""
	@echo "Configuration:"
	@echo "  make config-cursor  - Configure Cursor MCP integration"
	@echo "  make config-claude  - Configure Claude Code integration"
	@echo ""
	@echo "Utilities:"
	@echo "  make logs           - View live logs"
	@echo "  make test           - Test MCP connection"
	@echo "  make clean          - Clean up log files"
	@echo "  make setup          - Full setup (install + start)"
	@echo ""
	@echo "For detailed instructions, see README.md"

# Install all dependencies
install:
	@echo "📦 Installing dependencies..."
	@echo ""
	@echo "Installing Node.js dependencies..."
	@cd server && npm install
	@echo ""
	@echo "Setting up Python virtual environment..."
	@if [ ! -d venv ]; then \
		python3 -m venv venv; \
		echo "  ✅ Virtual environment created"; \
	else \
		echo "  ✅ Virtual environment already exists"; \
	fi
	@echo ""
	@echo "Installing Python dependencies..."
	@./venv/bin/pip install -r server/requirements.txt
	@echo ""
	@echo "✅ Installation complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Copy utils/mcp-logger/ to your WeChat mini-app"
	@echo "  2. Add require('./utils/mcp-logger/index.js') to app.js"
	@echo "  3. Run 'make start' to start MCP services"
	@echo "  4. Run 'make config-cursor' to configure Cursor"

# Start MCP services
start:
	@echo "🚀 Starting WeChat DevTools Log MCP..."
	@echo ""
	@mkdir -p logs
	@echo "Starting log collection server (port 3001)..."
	@node server/log-collector.js > logs/server.log 2>&1 & echo $$! > logs/server.pid
	@sleep 2
	@echo "Starting MCP server (stdio)..."
	@echo "  Note: MCP server runs on-demand via LLM agent connection"
	@echo ""
	@sleep 1
	@echo "✅ Services started!"
	@echo ""
	@echo "📊 Service Status:"
	@$(MAKE) --no-print-directory status
	@echo ""
	@echo "Next steps:"
	@echo "  • Open WeChat DevTools and load your mini-app"
	@echo "  • Run 'make config-cursor' to configure Cursor"
	@echo "  • Check logs with 'make logs'"
	@echo "  • Test connection with 'make test'"

# Stop all services
stop:
	@echo "🛑 Stopping MCP services..."
	@if [ -f logs/server.pid ]; then \
		kill `cat logs/server.pid` 2>/dev/null && echo "  ✅ Log collection server stopped" || echo "  ⚠️  Log server not running"; \
		rm -f logs/server.pid; \
	else \
		echo "  ⚠️  No server PID file found"; \
	fi
	@pkill -f "log-collector.js" 2>/dev/null && echo "  ✅ Cleaned up any remaining log-collector processes" || true
	@pkill -f "mcp-server.py" 2>/dev/null && echo "  ✅ Cleaned up any remaining MCP server processes" || true
	@echo ""
	@echo "✅ All services stopped"

# Restart services
restart: stop
	@echo ""
	@echo "⏳ Waiting 2 seconds before restart..."
	@sleep 2
	@$(MAKE) start

# Check service status
status:
	@echo "📊 Service Status:"
	@echo ""
	@echo -n "  • Log Collection Server (port 3001): "
	@curl -s -f http://127.0.0.1:3001/health > /dev/null 2>&1 && echo "✅ Running" || echo "❌ Down"
	@echo -n "  • MCP Server (stdio): "
	@echo "ℹ️  On-demand (via LLM agent)"
	@echo ""
	@if curl -s http://127.0.0.1:3001/health 2>/dev/null | grep -q '"status":"healthy"'; then \
		echo "🏥 Health Check: ✅ Healthy"; \
		echo ""; \
		curl -s http://127.0.0.1:3001/health 2>/dev/null | python3 -m json.tool 2>/dev/null | grep -E '(uptime|requestCount|errorCount|logFileSize)' | sed 's/^/  /'; \
	else \
		echo "🏥 Health Check: ❌ Unhealthy or Down"; \
	fi

# Configure Cursor MCP integration
config-cursor:
	@node scripts/config-generator.js --agent cursor

# Configure Claude Code MCP integration
config-claude:
	@node scripts/config-generator.js --agent claude

# View live logs
logs:
	@echo "📜 Live Logs (Ctrl+C to exit):"
	@echo "==============================="
	@echo ""
	@if [ ! -f logs/wechat_logs.log ]; then \
		echo "⚠️  No logs yet."; \
		echo ""; \
		echo "To generate logs:"; \
		echo "  1. Make sure services are running (make start)"; \
		echo "  2. Open WeChat DevTools"; \
		echo "  3. Load your mini-app with MCP logger integrated"; \
		echo "  4. Check console.log() calls are being made"; \
		echo ""; \
		echo "Waiting for logs..."; \
		echo ""; \
	fi
	@tail -f logs/wechat_logs.log 2>/dev/null || (echo "Waiting for log file..." && sleep 2 && tail -f logs/wechat_logs.log)

# Test MCP connection
test:
	@echo "🧪 Testing MCP Connection"
	@echo "========================="
	@echo ""
	@echo "1. Testing log collection server..."
	@if curl -s http://127.0.0.1:3001/health > /dev/null 2>&1; then \
		echo "   ✅ Log server: Running"; \
		curl -s http://127.0.0.1:3001/health | python3 -m json.tool 2>/dev/null; \
	else \
		echo "   ❌ Log server: Not running"; \
		echo "   Run 'make start' to start services"; \
		exit 1; \
	fi
	@echo ""
	@echo "2. Sending test log..."
	@curl -s -X POST http://127.0.0.1:3001/log \
		-H "Content-Type: application/json" \
		-d '{"level":"test","message":"Test from Makefile","timestamp":'`date +%s000`',"source":"makefile"}' \
		> /dev/null && echo "   ✅ Test log sent successfully" || echo "   ❌ Failed to send test log"
	@echo ""
	@echo "3. Verifying log file..."
	@if [ -f logs/wechat_logs.log ]; then \
		echo "   ✅ Log file exists"; \
		echo "   📊 File size: `ls -lh logs/wechat_logs.log | awk '{print $$5}'`"; \
		echo "   📊 Line count: `wc -l < logs/wechat_logs.log` logs"; \
		echo ""; \
		echo "   Last log entry:"; \
		tail -n 1 logs/wechat_logs.log | python3 -m json.tool 2>/dev/null | sed 's/^/   /'; \
	else \
		echo "   ⚠️  Log file not created yet"; \
	fi
	@echo ""
	@echo "✅ Connection test complete!"

# Clean up log files
clean:
	@echo "🧹 Cleaning up..."
	@rm -f logs/*.log logs/*.pid
	@echo "✅ Log files and PID files removed"
	@echo ""
	@echo "Services are still running. Use 'make stop' to stop them."

# Full setup (install + start)
setup:
	@./scripts/setup.sh

# Hidden target - show detailed status (used by start command)
_detailed-status:
	@curl -s http://127.0.0.1:3001/health 2>/dev/null | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"  Uptime: {data['uptime']/1000:.1f}s\"); print(f\"  Requests: {data['requestCount']}\"); print(f\"  Log file: {data['logFilePath']}\");" 2>/dev/null || echo "  (Details unavailable)"
