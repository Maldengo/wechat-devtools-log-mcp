#!/usr/bin/env node
/**
 * MCP Configuration Generator
 * Automatically generates MCP server configuration for LLM agents
 * Supports: Cursor, Claude Code
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const agentFlag = args.indexOf('--agent');
const agent = agentFlag !== -1 ? args[agentFlag + 1] : null;

// Get absolute paths
const projectRoot = path.resolve(__dirname, '..');
const mcpServerPath = path.join(projectRoot, 'server', 'mcp-server.py');
const logFilePath = path.join(projectRoot, 'logs', 'wechat_logs.log');

/**
 * Generate Cursor MCP configuration
 */
function generateCursorConfig() {
  const configDir = path.join(os.homedir(), '.cursor');
  const configFile = path.join(configDir, 'mcp.json');
  
  console.log('📝 Generating Cursor MCP configuration...');
  console.log('');
  
  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log(`  ✅ Created directory: ${configDir}`);
  }
  
  // Read existing config or create new one
  let config = {};
  if (fs.existsSync(configFile)) {
    try {
      const existingConfig = fs.readFileSync(configFile, 'utf8');
      config = JSON.parse(existingConfig);
      console.log('  ✅ Found existing configuration');
    } catch (e) {
      console.log('  ⚠️  Warning: Could not parse existing config, creating new one');
      config = {};
    }
  }
  
  // Add or update wechat-devtools-log-mcp configuration
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers['wechat-devtools-log-mcp'] = {
    command: 'python3',
    args: [mcpServerPath],
    env: {
      WECHAT_LOG_PATH: logFilePath
    }
  };
  
  // Write configuration
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log('  ✅ Configuration written to:', configFile);
  console.log('');
  console.log('📋 Configuration:');
  console.log('');
  console.log(JSON.stringify(config.mcpServers['wechat-devtools-log-mcp'], null, 2));
  console.log('');
  console.log('✅ Cursor MCP configuration complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Restart Cursor to apply changes');
  console.log('  2. Start MCP services: make start');
  console.log('  3. Open your WeChat project in Cursor');
  console.log('  4. Use MCP tools in Cursor chat');
  console.log('');
}

/**
 * Generate Claude Code MCP configuration
 */
function generateClaudeConfig() {
  const configDir = path.join(os.homedir(), '.claude-code');
  const configFile = path.join(configDir, 'mcp-servers.json');
  
  console.log('📝 Generating Claude Code MCP configuration...');
  console.log('');
  
  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log(`  ✅ Created directory: ${configDir}`);
  }
  
  // Read existing config or create new one
  let config = {};
  if (fs.existsSync(configFile)) {
    try {
      const existingConfig = fs.readFileSync(configFile, 'utf8');
      config = JSON.parse(existingConfig);
      console.log('  ✅ Found existing configuration');
    } catch (e) {
      console.log('  ⚠️  Warning: Could not parse existing config, creating new one');
      config = {};
    }
  }
  
  // Add or update wechat-devtools-log-mcp configuration
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers['wechat-devtools-log-mcp'] = {
    command: 'python3',
    args: [mcpServerPath],
    env: {
      WECHAT_LOG_PATH: logFilePath
    }
  };
  
  // Write configuration
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log('  ✅ Configuration written to:', configFile);
  console.log('');
  console.log('📋 Configuration:');
  console.log('');
  console.log(JSON.stringify(config.mcpServers['wechat-devtools-log-mcp'], null, 2));
  console.log('');
  console.log('✅ Claude Code MCP configuration complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Restart Claude Code to apply changes');
  console.log('  2. Start MCP services: make start');
  console.log('  3. Open your WeChat project in Claude Code');
  console.log('  4. Use MCP tools in Claude Code');
  console.log('');
}

/**
 * Show help message
 */
function showHelp() {
  console.log('');
  console.log('🔧 MCP Configuration Generator');
  console.log('==============================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/config-generator.js --agent <agent-name>');
  console.log('');
  console.log('Supported agents:');
  console.log('  cursor      - Configure Cursor MCP integration');
  console.log('  claude      - Configure Claude Code MCP integration');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/config-generator.js --agent cursor');
  console.log('  node scripts/config-generator.js --agent claude');
  console.log('');
  console.log('Or use Makefile shortcuts:');
  console.log('  make config-cursor');
  console.log('  make config-claude');
  console.log('');
}

/**
 * Validate paths
 */
function validatePaths() {
  const errors = [];
  
  if (!fs.existsSync(mcpServerPath)) {
    errors.push(`MCP server not found: ${mcpServerPath}`);
  }
  
  const logsDir = path.dirname(logFilePath);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log(`  ✅ Created logs directory: ${logsDir}`);
  }
  
  return errors;
}

/**
 * Main execution
 */
function main() {
  // Show help if no agent specified
  if (!agent) {
    showHelp();
    process.exit(1);
  }
  
  // Validate paths
  const errors = validatePaths();
  if (errors.length > 0) {
    console.error('');
    console.error('❌ Configuration failed:');
    console.error('');
    errors.forEach(error => console.error(`  • ${error}`));
    console.error('');
    console.error('Make sure you have run "make install" first.');
    console.error('');
    process.exit(1);
  }
  
  // Generate configuration based on agent
  switch (agent.toLowerCase()) {
    case 'cursor':
      generateCursorConfig();
      break;
    case 'claude':
    case 'claude-code':
      generateClaudeConfig();
      break;
    default:
      console.error('');
      console.error(`❌ Unknown agent: ${agent}`);
      console.error('');
      console.error('Supported agents: cursor, claude');
      console.error('');
      showHelp();
      process.exit(1);
  }
}

// Run
main();
