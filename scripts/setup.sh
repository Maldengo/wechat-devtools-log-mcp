#!/bin/bash
# Setup script for wechat-devtools-log-mcp
# Runs complete environment setup

set -e

echo "🚀 wechat-devtools-log-mcp Setup"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v14+ first."
    echo "   macOS: brew install node"
    echo "   Linux: sudo apt-get install nodejs"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version too old: $(node --version)"
    echo "   Required: v14.0.0 or higher"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+ first."
    echo "   macOS: brew install python3"
    echo "   Linux: sudo apt-get install python3"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python: $(python3 --version)"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install npm dependencies
echo "Installing Node.js dependencies..."
cd server && npm install && cd ..
echo "✅ Node.js dependencies installed"
echo ""

# Create virtual environment
echo "Setting up Python virtual environment..."
if [ ! -d venv ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
./venv/bin/pip install -q -r server/requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Create necessary directories
echo "Creating directories..."
mkdir -p logs config scripts examples docs
echo "✅ Directories created"
echo ""

# Setup complete
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Copy utils/mcp-logger/ to your WeChat mini-app"
echo "  2. Add require('./utils/mcp-logger/index.js') to app.js"
echo "  3. Run 'make start' to start MCP services"
echo "  4. Run 'make config-cursor' to configure Cursor"
echo ""
echo "For detailed instructions, see README.md"
echo ""

# Offer to configure Cursor
read -p "Would you like to configure Cursor now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/config-generator.js --agent cursor
    echo ""
    echo "✅ Cursor configured! Please restart Cursor."
fi

echo ""
echo "🎉 Ready to use wechat-devtools-log-mcp!"
echo ""
