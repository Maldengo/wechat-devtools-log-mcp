# Repository Structure

This document explains what files are included in the public repository vs. kept local for development.

---

## 📁 Files Included in Git (Public)

### 🎯 Core Files
- `README.md` / `README.zh-CN.md` - Project introduction
- `HOWTO.md` / `HOWTO.zh-CN.md` - Setup guides
- `LICENSE` - MIT License
- `Makefile` - Build and run commands
- `package.json` - Project metadata

### 🛠️ Source Code
- `utils/mcp-logger/` - Copy-paste utility library
- `server/` - Log collection server and MCP server
- `scripts/` - Setup and configuration scripts
- `config/` - Configuration templates

### 📚 Documentation
- `docs/README.zh-CN.md` - Chinese documentation navigation
- `docs/api-reference.md` - Complete API documentation
- `docs/frontend-setup.md` - Technical integration guide
- `docs/troubleshooting.md` - Problem resolution guide
- `docs/cursor-integration-guide.md` - Cursor-specific guide

### 📦 Examples
- `examples/README.md` - Examples overview
- `examples/basic-integration/` - Basic integration example
- `examples/test-log-mcp-integration.md` - Test project guide

### 📁 Supporting Files
- `logs/README.md` - Log directory explanation
- `logs/.gitkeep` - Keep logs directory in git
- `.gitignore` - Git ignore rules

---

## 🚫 Files Excluded from Git (Development Only)

### 📋 Development Documentation
- `.github/STORY_*.md` - Individual story completion docs
- `.github/EPIC_*.md` - Epic completion reports
- `.github/TEST_*.md` - Test result documentation
- `brainstorm_session.md` - Initial brainstorming notes
- `docs/prd.md` - Product requirements document

### 📝 Development Tracking
- `PROGRESS.md` - Development progress tracking
- `CURSOR_SETUP_CHECKLIST.md` - Cursor setup checklist
- `CURSOR_FIX.md` - Cursor configuration fixes
- `QUICK_TEST.md` - Quick testing notes

### 🧪 Test Projects
- `test-*/` - Local test projects
- `temp-*/` - Temporary test projects
- `local-*/` - Local development projects

### 💾 Runtime Files
- `logs/*.log` - Log files
- `logs/*.pid` - Process ID files
- `node_modules/` - Node.js dependencies
- `venv/` - Python virtual environment
- `__pycache__/` - Python cache files

---

## 🎯 Why This Structure?

### ✅ Included Files
**User-focused content:**
- Everything needed to use the tool
- Complete documentation in multiple languages
- Working examples and templates
- Clear setup instructions

### ❌ Excluded Files
**Development-only content:**
- Internal development process documentation
- Test results and verification reports
- Brainstorming and planning notes
- User-specific configuration files

---

## 🔄 For Contributors

### Adding New Files
When adding new files, consider:

1. **Is this useful for end users?** → Include in git
2. **Is this internal development tracking?** → Exclude from git
3. **Is this user-specific configuration?** → Exclude from git

### Development Workflow
- Development docs are kept local for team reference
- Only user-facing content goes to public repository
- Clean separation between development and user content

---

**Last Updated**: 2025-09-30  
**Purpose**: Maintain clean public repository focused on user experience
