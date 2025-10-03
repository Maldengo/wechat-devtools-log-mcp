# 微信小程序日志 MCP 工具 - 完整设置指南 🚀

> **从零开始，5分钟内让你的小程序和 AI 助手成为好朋友！** 这个指南会手把手教你如何设置，即使你从来没有接触过 MCP 也没关系。

---

## 📋 目录

1. [准备工作](#1-准备工作)
2. [安装工具](#2-安装工具)
3. [集成到小程序](#3-集成到小程序)
4. [配置 AI 助手](#4-配置-ai-助手)
5. [测试连接](#5-测试连接)
6. [日常使用](#6-日常使用)
7. [常见问题](#7-常见问题)
8. [进阶配置](#8-进阶配置)
9. [故障排除](#9-故障排除)
10. [最佳实践](#10-最佳实践)

---

## 1. 准备工作

### 🖥️ 系统要求

**必须安装的软件：**
- **Node.js** v14.0.0 或更高版本
- **Python** 3.8 或更高版本
- **微信开发者工具** (最新版本)
- **Cursor** 或 **Claude** (AI 助手)

**检查你的环境：**
```bash
# 检查 Node.js
node --version
# 应该显示 v14.x.x 或更高

# 检查 Python
python3 --version
# 应该显示 Python 3.8.x 或更高
```

**如果版本不够，请先升级：**
```bash
# macOS (使用 Homebrew)
brew install node python3

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install nodejs python3

# Windows
# 从官网下载安装包：https://nodejs.org/ 和 https://python.org/
```

### 📁 项目结构

安装完成后，你的目录结构应该是这样的：
```
wechat-devtools-log-mcp/
├── utils/mcp-logger/          # 工具库（要复制到你的小程序）
├── server/                    # 日志服务器
├── scripts/                   # 安装脚本
├── docs/                      # 文档
├── examples/                  # 示例项目
└── Makefile                   # 快捷命令
```

---

## 2. 安装工具

### 🚀 一键安装（推荐）

```bash
# 克隆项目
git clone https://github.com/your-org/wechat-devtools-log-mcp.git
cd wechat-devtools-log-mcp

# 一键安装（会自动检查环境、安装依赖、创建目录）
make setup
```

**脚本会自动做什么：**
1. ✅ 检查 Node.js 和 Python 版本
2. ✅ 安装 npm 依赖（express, body-parser, cors）
3. ✅ 创建 Python 虚拟环境
4. ✅ 安装 Python 依赖（watchdog）
5. ✅ 创建必要的目录
6. ✅ 询问是否配置 Cursor

**如果安装成功，你会看到：**
```
================================
✅ Setup Complete!
================================

Next steps:
  1. Copy utils/mcp-logger/ to your WeChat mini-app
  2. Add require('./utils/mcp-logger/index.js') to app.js
  3. Run 'make start' to start MCP services
  4. Run 'make config-cursor' to configure Cursor
```

### 🔧 手动安装（如果自动安装失败）

如果 `make setup` 失败了，可以手动安装：

```bash
# 1. 安装 Node.js 依赖
cd server
npm install
cd ..

# 2. 创建 Python 虚拟环境
python3 -m venv venv

# 3. 安装 Python 依赖
./venv/bin/pip install -r server/requirements.txt

---

## 3. 集成到小程序

### 📂 第一步：复制工具库

**找到你的小程序项目目录，然后复制工具库：**
```bash
# 假设你的小程序在 /path/to/your-wechat-app/
cp -r /path/to/wechat-devtools-log-mcp/utils/mcp-logger/ /path/to/your-wechat-app/utils/
```

**复制完成后，你的小程序目录结构应该是：**
```
your-wechat-app/
├── app.js
├── app.json
├── pages/
├── utils/
│   ├── mcp-logger/           # 新复制的工具库
│   │   ├── index.js
│   │   ├── logger.js
│   │   ├── config.js
│   │   └── env-template.js
│   └── env.js                # 你的环境配置
└── ...
```

### 📝 第二步：修改 app.js

**在你的 `app.js` 文件的最顶部添加一行：**
```javascript
// 必须是第一行！在 App({ 之前
require('./utils/mcp-logger/index.js');

App({
  // 你的其他代码...
  onLaunch() {
    console.log('App launched');
    // 现在这个 console.log 会自动发送给 AI 助手！
  }
});
```

**重要提示：**
- ✅ `require()` 必须在最顶部
- ✅ 必须在 `App({` 之前
- ✅ 路径要正确（相对于 app.js）

### ⚙️ 第三步：配置环境

**检查你的 `utils/env.js` 文件：**
```javascript
var environments = {
  development: {
    DEBUG: true,        // 必须是 true，否则不会工作
    MCP_LOGGING: true   // 启用 MCP 日志
  },
  production: {
    DEBUG: false,       // 生产环境设为 false
    MCP_LOGGING: false  // 生产环境关闭
  }
};

var CURRENT_ENV = 'development';  // 开发时用 development

module.exports = environments[CURRENT_ENV];
```

**如果没有 `utils/env.js` 文件，创建一个：**
```bash
# 复制模板
cp utils/mcp-logger/env-template.js utils/env.js
```

### 🔧 第四步：配置微信开发者工具

**修改 `project.config.json`：**
```json
{
  "setting": {
    "urlCheck": false,     // 必须设为 false
    "checkSiteMap": false  // 可选，关闭 sitemap 检查
  }
}
```

**重要：**
1. 设置 `urlCheck: false` 后，必须**重新打开项目**
2. 在微信开发者工具中：文件 → 关闭项目 → 重新打开项目
3. 这样设置才会生效

---

## 4. 配置 AI 助手

### 🤖 配置 Cursor

**方法一：自动配置（推荐）**
```bash
make config-cursor
```

**方法二：手动配置**
1. 打开 Cursor
2. 按 `Cmd+,`（Mac）或 `Ctrl+,`（Windows）打开设置
3. 搜索 "MCP"
4. 点击 "Edit in settings.json"
5. 添加配置：

```json
{
  "mcpServers": {
    "wechat-devtools-log-mcp": {
      "command": "python3",
      "args": [
        "/完整路径/wechat-devtools-log-mcp/server/mcp-server.py"
      ],
      "env": {
        "WECHAT_LOG_PATH": "/完整路径/wechat-devtools-log-mcp/logs/wechat_logs.log"
      }
    }
  }
}
```

**配置完成后：**
1. 完全退出 Cursor（`Cmd+Q` 或 `Ctrl+Q`）
2. 重新打开 Cursor
3. 在设置中应该能看到 "wechat-devtools-log-mcp" 已连接

### 🧠 配置 Claude（可选）

```bash
make config-claude
```

或者手动配置 Claude 的 MCP 设置（具体方法取决于你使用的 Claude 客户端）。

---

## 5. 测试连接

### 🚀 启动服务

```bash
# 启动日志服务器
make start
```

**你应该看到：**
```
🚀 Starting wechat-devtools-log-mcp services...

📊 Service Status:
  • Log Collection Server (port 3001): ✅ Running
  • MCP Server (stdio): ℹ️ On-demand (via LLM agent)
🏥 Health Check: ✅ Healthy
```

### 🧪 测试连接

```bash
# 发送测试日志
make test
```

**如果成功，你会看到：**
```
🧪 Testing MCP Connection
=========================

1. Testing log collection server...
   ✅ Log server: Running

2. Sending test log...
   ✅ Test log sent successfully

3. Verifying log file...
   ✅ Log file exists
   📊 File size: 1.2K
   📊 Line count: 15 logs

✅ Connection test complete!
```

### 📱 测试小程序

1. **打开你的小程序**（在微信开发者工具中）
2. **查看控制台**，应该看到类似这样的消息：
   ```
   🚀 MCP Logger: Initializing...
   📝 MCP Logger: Configuration loaded
   ✅ MCP Logger: Ready to send logs
   ```
3. **添加一些测试代码**：
   ```javascript
   // 在你的页面中
   console.log('Hello AI!', 'This is a test log');
   console.warn('This is a warning');
   console.error('This is an error');
   ```
4. **在 Cursor 中测试**：
   ```
   你：帮我查看最近的日志
   AI：我看到你发送了 3 条日志，包括一个错误...
   ```

---

## 6. 日常使用

### 🎯 基本工作流程

**1. 开始开发**
```bash
# 启动服务（如果还没启动）
make start

# 打开你的小程序项目
# 打开 Cursor
```

**2. 正常开发**
```javascript
// 在你的代码中正常使用 console.log
console.log('用户点击了按钮', buttonId);
console.warn('API 响应较慢', responseTime);
console.error('网络请求失败', error);
```

**3. 和 AI 助手对话**
```
你：AI，帮我看看最近的错误
AI：我看到有一个网络请求失败的错误，让我分析一下...

你：我的页面加载很慢，帮我看看
AI：从日志看，数据请求耗时 2.3 秒，建议...

你：这段代码有什么问题吗？
AI：根据你的日志，我注意到...
```

### 🔧 常用命令

```bash
# 查看服务状态
make status

# 查看实时日志
make logs

# 停止服务
make stop

# 重启服务
make restart

# 清理日志文件
make clean
```

### 📊 查看日志

**在终端查看实时日志：**
```bash
make logs
# 按 Ctrl+C 退出
```

**在 Cursor 中查看：**
```
你：显示最近的 10 条日志
AI：📋 最近的 10 条日志：
[时间] LOG: 用户点击了按钮
[时间] WARN: API 响应较慢
...
```

---

## 7. 常见问题

### ❓ 问题：看不到 MCP Logger 初始化消息

**症状：** 小程序控制台没有显示 "🚀 MCP Logger: Initializing..."

**解决方案：**
1. 检查 `require()` 是否在 app.js 最顶部
2. 检查路径是否正确
3. 检查 `DEBUG: true` 是否设置
4. 重新编译小程序

### ❓ 问题：看到 "request:fail url not in domain list" 错误

**症状：** 控制台显示域名白名单错误

**解决方案：**
1. 确保 `project.config.json` 中 `urlCheck: false`
2. **重新打开项目**（重要！）
3. 重新编译

### ❓ 问题：Cursor 显示 "No tools, prompts"

**症状：** Cursor 中看不到 wechat-devtools-log-mcp 工具

**解决方案：**
1. 检查配置是否正确写入 `~/.cursor/mcp.json`
2. **完全重启 Cursor**（`Cmd+Q` 然后重新打开）
3. 检查 Python 路径是否正确

### ❓ 问题：日志没有发送到 AI 助手

**症状：** 控制台有日志，但 AI 助手看不到

**解决方案：**
1. 确保运行了 `make start`
2. 确保日志服务器正在运行（`make status`）
3. 发送测试日志（`make test`）
4. 检查 MCP 配置是否正确

### ❓ 问题：生产环境担心性能影响

**症状：** 担心生产环境会有性能问题

**解决方案：**
**完全不用担心！** 当 `DEBUG: false` 时：
- 所有 MCP 相关代码都是空的
- 零性能影响
- 零网络请求
- 零内存占用

---

## 8. 进阶配置

### 🎛️ 自定义配置

**修改日志服务器端口：**
```bash
# 使用不同端口启动
PORT=3002 node server/log-collector.js &

# 更新小程序配置
# 在 utils/env.js 中设置
MCP_LOG_ENDPOINT: 'http://127.0.0.1:3002/log'
```

**自定义重试次数：**
```javascript
// 在 utils/mcp-logger/config.js 中
module.exports = {
  MAX_RETRIES: 5,        // 增加重试次数
  TIMEOUT: 10000,        // 增加超时时间
  MAX_FALLBACK_LOGS: 200 // 增加本地存储数量
};
```

**过滤特定日志：**
```javascript
// 在 utils/mcp-logger/logger.js 中修改 console.log 覆盖
console.log = function(...args) {
  // 只发送包含特定关键词的日志
  if (args.some(arg => String(arg).includes('DEBUG'))) {
    sendToMCP('log', { arguments: args });
  }
  originalConsoleLog.apply(console, args);
};
```

### 🔧 多项目支持

**如果你有多个小程序项目：**
1. 每个项目都可以使用同一个 MCP 服务器
2. 所有日志都会混合在一起
3. AI 助手可以分析所有项目的日志

**或者为每个项目创建单独的日志文件：**
```bash
# 项目 A
WECHAT_LOG_PATH=/path/to/logs/project-a.log node server/log-collector.js &

# 项目 B  
WECHAT_LOG_PATH=/path/to/logs/project-b.log node server/log-collector.js &
```

---

## 9. 故障排除

### 🔍 诊断命令

**检查服务状态：**
```bash
make status
```

**检查端口占用：**
```bash
lsof -i :3001
```

**检查日志文件：**
```bash
# 查看日志文件
cat logs/wechat_logs.log

# 统计日志数量
wc -l logs/wechat_logs.log

# 查看最新日志
tail -f logs/wechat_logs.log
```

**测试网络连接：**
```bash
# 测试健康检查
curl http://127.0.0.1:3001/health

# 测试日志发送
curl -X POST http://127.0.0.1:3001/log \
  -H "Content-Type: application/json" \
  -d '{"level":"test","arguments":["测试"],"timestamp":'$(date +%s000)'}'
```

### 🚨 常见错误及解决方案

**错误：`externally-managed-environment`**
```
解决方案：使用 make setup，它会自动创建虚拟环境
```

**错误：`EADDRINUSE: address already in use`**
```bash
# 找到占用端口的进程
lsof -i :3001

# 杀死进程
kill <PID>

# 重新启动
make start
```

**错误：`Permission denied`**
```bash
# 修复权限
chmod 755 logs/
chmod 644 logs/*.log
```

**错误：`No such file or directory`**
```bash
# 创建缺失的目录
mkdir -p logs config
```

---

## 10. 最佳实践

### 💡 开发建议

**1. 使用有意义的日志**
```javascript
// ❌ 不好的日志
console.log('debug');

// ✅ 好的日志
console.log('用户登录', { userId: 123, method: 'wechat' });
```

**2. 使用适当的日志级别**
```javascript
console.log('普通信息');     // 一般信息
console.info('重要信息');    // 重要信息
console.warn('警告信息');    // 警告
console.error('错误信息');   // 错误
```

**3. 包含上下文信息**
```javascript
// ✅ 包含上下文
console.error('API 请求失败', {
  url: '/api/user',
  method: 'POST',
  error: error.message,
  timestamp: Date.now()
});
```

### 🛡️ 安全建议

**1. 生产环境配置**
```javascript
// 确保生产环境设置
var CURRENT_ENV = 'production';  // 部署前改为 production
```

**2. 敏感信息过滤**
```javascript
// 过滤敏感信息
function sanitizeLog(data) {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  return sanitized;
}
```

**3. 日志轮转**
```bash
# 定期清理旧日志
make clean

# 或者设置自动清理（Linux/macOS）
# 使用 logrotate 或 cron 任务
```

### 🚀 性能建议

**1. 避免过多的日志**
```javascript
// ❌ 在循环中记录太多日志
for (let i = 0; i < 1000; i++) {
  console.log('Processing item', i);
}

// ✅ 批量记录
console.log('Processing 1000 items');
```

**2. 使用条件日志**
```javascript
// ✅ 只在需要时记录
if (DEBUG_MODE) {
  console.log('Detailed debug info', data);
}
```

**3. 异步处理**
```javascript
// ✅ 日志发送是异步的，不会阻塞主线程
console.log('This is fast');  // 立即返回
```

---

## 🎉 恭喜！

如果你按照这个指南操作，现在你应该能够：

✅ 让 AI 助手实时看到你的小程序日志  
✅ 通过对话的方式调试代码  
✅ 让 AI 帮你分析错误和性能问题  
✅ 享受更高效的开发体验  

### 🎯 下一步

1. **尝试不同的 AI 助手**：Cursor、Claude 等
2. **探索高级功能**：日志过滤、自定义配置等
3. **分享给团队**：让其他开发者也能享受这个工具
4. **贡献代码**：如果你有好的想法，欢迎提交 PR！

### 💬 获取帮助

如果遇到问题：
1. 查看 [故障排除](#9-故障排除) 部分
2. 查看 [docs/troubleshooting.md](./docs/troubleshooting.md)
3. 在 [GitHub Issues](https://github.com/your-org/wechat-devtools-log-mcp/issues) 提问
4. 加入 [GitHub Discussions](https://github.com/your-org/wechat-devtools-log-mcp/discussions) 讨论

---

**最后更新**: 2025-09-30  
**版本**: 1.0.0

> 🎭 **幽默时刻**: 现在你的 AI 助手比你更了解你的代码了！不过别担心，它不会抢你的工作，只会让你的工作更轻松 😄
