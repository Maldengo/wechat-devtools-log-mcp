# WeChat 小程序日志 MCP 工具 🚀

> **让 AI 助手帮你调试微信小程序！** 这个工具可以把你的小程序日志实时传输给 Cursor、Claude 等 AI 助手，让调试变得像聊天一样简单。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org/)

---

## 🤔 为什么需要这个工具？

想象一下这样的场景：
- 你在开发微信小程序
- 遇到了一个诡异的 bug，`console.log` 打了一堆日志
- 你想让 AI 助手帮你分析，但是复制粘贴日志太麻烦了
- 而且每次都要重新复制，太累了...

**现在有了这个工具，一切都变得简单了！** 🎉

- ✨ 小程序日志自动发送给 AI 助手
- 🤖 AI 可以实时看到你的调试信息
- 💬 就像和 AI 聊天一样调试代码
- 🚀 再也不用复制粘贴日志了！

---

## 🌟 主要功能

### 🎯 实时日志流
- **自动捕获**：拦截所有 `console.log/info/warn/error`
- **实时传输**：日志立即发送给 AI 助手
- **智能重试**：网络断了自动重连，不会丢日志
- **本地备份**：网络不好时自动保存到本地存储

### 🤖 AI 助手集成
- **Cursor 支持**：完美集成 Cursor 的 MCP 功能
- **Claude 支持**：也可以和 Claude 配合使用
- **智能分析**：AI 可以分析错误模式、性能问题
- **调试助手**：让 AI 帮你找 bug，比你自己找还快

### 🛠️ 开发者友好
- **零配置**：复制粘贴就能用，不需要复杂设置
- **生产安全**：生产环境自动关闭，零性能影响
- **中文文档**：专门为中文开发者准备
- **幽默风格**：文档写得有趣，不会看睡着 😄

---

## 🚀 快速开始

### 1️⃣ 克隆项目
```bash
git clone https://github.com/your-org/wechat-devtools-log-mcp.git
cd wechat-devtools-log-mcp
```

### 2️⃣ 一键安装
```bash
make setup
# 或者
./scripts/setup.sh
```

**就这么简单！** 脚本会自动：
- 检查 Node.js 和 Python 环境
- 安装所有依赖
- 创建必要的目录
- 甚至帮你配置 Cursor（如果你愿意的话）

### 3️⃣ 集成到你的小程序

**复制工具库到你的项目：**
```bash
cp -r utils/mcp-logger/ /path/to/your-wechat-app/utils/
```

**在你的 `app.js` 最顶部添加一行：**
```javascript
// 必须是第一行！
require('./utils/mcp-logger/index.js');

App({
  // 你的其他代码...
});
```

**搞定！** 🎉 现在你的所有 `console.log` 都会自动发送给 AI 助手。

### 4️⃣ 启动服务并连接 AI

```bash
# 启动日志服务器
make start

# 配置 Cursor（如果需要）
make config-cursor

# 重启 Cursor，然后就可以和 AI 聊天调试了！
```

---

## 📖 详细文档

### 📚 完整指南
- **[HOWTO.zh-CN.md](./HOWTO.zh-CN.md)** - 详细的中文设置指南（包含很多实用技巧）
- **[HOWTO.md](./HOWTO.md)** - 英文版详细指南
- **[docs/README.zh-CN.md](./docs/README.zh-CN.md)** - 中文文档导航

### 🔧 技术文档
- **[docs/frontend-setup.md](./docs/frontend-setup.md)** - 前端集成技术细节
- **[docs/troubleshooting.md](./docs/troubleshooting.md)** - 问题排查指南
- **[docs/api-reference.md](./docs/api-reference.md)** - 完整 API 文档

### 🎯 示例项目
- **[examples/test-log-mcp/](../test-log-mcp/)** - 完整的工作示例
- **[examples/README.md](./examples/README.md)** - 示例项目说明

---

## 💡 使用场景

### 🐛 调试 Bug
```
你：AI，帮我看看这个错误
AI：我看到你的日志显示 "API failed"，让我分析一下...
AI：根据错误模式，这可能是网络超时问题，建议检查...
```

### 📊 性能优化
```
你：我的页面加载很慢
AI：从日志看，数据请求耗时 2.3 秒，建议使用缓存...
AI：另外我注意到你有很多重复的 console.log，建议优化...
```

### 🔍 代码审查
```
你：帮我检查一下这段代码
AI：我看到你用了很多 console.log 调试，建议使用更结构化的日志...
AI：另外这个 API 调用没有错误处理，建议加上 try-catch...
```

---

## 🛠️ 常用命令

```bash
# 完整设置（推荐新手）
make setup

# 启动服务
make start

# 停止服务
make stop

# 查看状态
make status

# 查看实时日志
make logs

# 测试连接
make test

# 配置 Cursor
make config-cursor

# 配置 Claude
make config-claude

# 清理日志
make clean
```

---

## 🔧 配置说明

### 环境配置 (utils/env.js)
```javascript
var environments = {
  development: {
    DEBUG: true,        // 开发环境必须为 true
    MCP_LOGGING: true   // 启用 MCP 日志
  },
  production: {
    DEBUG: false,       // 生产环境必须为 false
    MCP_LOGGING: false  // 生产环境自动关闭
  }
};

var CURRENT_ENV = 'development';  // 开发时用 development
```

### 微信开发者工具配置 (project.config.json)
```json
{
  "setting": {
    "urlCheck": false  // 必须设为 false，允许访问 localhost
  }
}
```

**重要提示**：设置完 `urlCheck: false` 后，需要重新打开项目才会生效！

---

## ❓ 常见问题

### Q: 为什么我看不到日志？
**A**: 检查以下几点：
1. 确保 `DEBUG: true` 在 env.js 中
2. 确保 `urlCheck: false` 在 project.config.json 中
3. 确保运行了 `make start`
4. 重启微信开发者工具

### Q: 会影响生产环境性能吗？
**A**: 完全不会！当 `DEBUG: false` 时，所有 MCP 相关代码都是空的，零性能影响。

### Q: 可以同时连接多个 AI 助手吗？
**A**: 可以！每个 AI 助手都会收到相同的日志，你可以同时和 Cursor、Claude 聊天。

### Q: 日志会发送到云端吗？
**A**: 不会！所有日志都保存在本地，不会发送到任何云端服务。

### Q: 支持微信小游戏吗？
**A**: 支持！集成方法和小程序完全一样。

---

## 🎭 幽默时刻

> **开发者A**: "我用这个工具调试，AI 帮我找到了一个隐藏了 3 天的 bug..."
> 
> **开发者B**: "我的 AI 助手现在比我更了解我的代码 😅"
>
> **开发者C**: "终于不用在微信群里发截图问 bug 了，直接问 AI！"

---

## 🤝 贡献指南

欢迎贡献代码！请查看：
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - 行为准则

### 🐛 报告 Bug
发现 bug？请到 [Issues](https://github.com/your-org/wechat-devtools-log-mcp/issues) 报告。

### 💡 功能建议
有好的想法？欢迎提交 [Feature Request](https://github.com/your-org/wechat-devtools-log-mcp/issues)！

---

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

---

## 🙏 致谢

感谢所有贡献者和使用者！特别感谢：
- 微信小程序团队提供优秀的开发平台
- MCP 协议让 AI 集成变得简单
- 所有测试用户提供的宝贵反馈

---

## 📞 联系方式

- **GitHub**: [wechat-devtools-log-mcp](https://github.com/your-org/wechat-devtools-log-mcp)
- **Issues**: [报告问题](https://github.com/your-org/wechat-devtools-log-mcp/issues)
- **讨论**: [GitHub Discussions](https://github.com/your-org/wechat-devtools-log-mcp/discussions)

---

## 🎯 路线图

### ✅ 已完成
- [x] 基础日志收集功能
- [x] MCP 服务器实现
- [x] Cursor 集成
- [x] 中文文档
- [x] 示例项目

### 🔄 进行中
- [ ] 更多 AI 助手支持
- [ ] 日志过滤功能
- [ ] 性能监控集成

### 📋 计划中
- [ ] 云端日志同步（可选）
- [ ] 团队协作功能
- [ ] 插件系统

---

**最后更新**: 2025-09-30  
**版本**: 1.0.0  
**作者**: 微信小程序开发团队

> 💡 **小贴士**: 如果这个工具帮到了你，给个 ⭐ 支持一下！你的支持是我们继续改进的动力 🚀
