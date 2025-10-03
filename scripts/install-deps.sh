#!/bin/bash
# Install dependencies for wechat-devtools-log-mcp
# Can be run standalone or called by Makefile

set -e

echo "📦 Installing wechat-devtools-log-mcp dependencies..."
echo ""

# Navigate to project root (script is in scripts/)
cd "$(dirname "$0")/.."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd server
npm install
cd ..
echo "✅ Node.js: express, body-parser, cors installed"
echo ""

# Create Python virtual environment if needed
echo "Setting up Python virtual environment..."
if [ ! -d venv ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created at ./venv"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
./venv/bin/pip install -q --upgrade pip
./venv/bin/pip install -q -r server/requirements.txt
echo "✅ Python: watchdog installed"
echo ""

# Create logs directory
mkdir -p logs
echo "✅ Logs directory ready"
echo ""

echo "================================"
echo "✅ All dependencies installed!"
echo "================================"
echo ""
