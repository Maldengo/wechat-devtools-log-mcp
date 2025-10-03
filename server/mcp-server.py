#!/usr/bin/env python3
"""
MCP Server for WeChat DevTools Logs
This server provides tools for LLM agents (Cursor, Claude Code) to interact with WeChat development logs.

Protocol: MCP via stdio (JSON-RPC 2.0)
Tools: get_recent_logs, search_logs, get_error_summary, health_check
Prompts: analyze_logs, debug_session
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import logging

# Setup logging to stderr so it doesn't interfere with MCP communication
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

# Configuration - defaults can be overridden by environment variables
LOG_FILE_PATH = Path(os.getenv('WECHAT_LOG_PATH', '../logs/wechat_logs.log'))
if not LOG_FILE_PATH.is_absolute():
    LOG_FILE_PATH = (Path(__file__).parent / LOG_FILE_PATH).resolve()

LOG_LEVELS = {"DEBUG": 1, "INFO": 2, "WARN": 3, "ERROR": 4, "log": 2, "info": 2, "warn": 3, "error": 4}

logger.info(f"MCP Server starting with log file: {LOG_FILE_PATH}")


class WeChatMCPServer:
    """MCP Server for WeChat DevTools log integration"""
    
    def __init__(self):
        self.name = "wechat-devtools-log-mcp"
        self.version = "1.0.0"
        self.start_time = None
        self.request_count = 0
        self.error_count = 0
        self.last_error = None
        
    async def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Handle incoming MCP requests"""
        method = request.get("method")
        params = request.get("params", {})
        request_id = request.get("id")
        
        self.request_count += 1
        
        try:
            if method == "initialize":
                return await self._handle_initialize(request_id, params)
            elif method == "tools/list":
                return await self._handle_tools_list(request_id)
            elif method == "tools/call":
                return await self._handle_tools_call(request_id, params)
            elif method == "prompts/list":
                return await self._handle_prompts_list(request_id)
            elif method == "prompts/get":
                return await self._handle_prompts_get(request_id, params)
            else:
                return self._error_response(request_id, -32601, f"Method not found: {method}")
        except Exception as e:
            self.error_count += 1
            self.last_error = str(e)
            logger.error(f"Error handling request: {e}")
            return self._error_response(request_id, -32603, f"Internal error: {str(e)}")

    async def _handle_initialize(self, request_id: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle initialization request"""
        # Record start time on first initialize
        if self.start_time is None:
            self.start_time = asyncio.get_event_loop().time()
        
        logger.info(f"Initializing MCP server: {self.name} v{self.version}")
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "prompts": {}
                },
                "serverInfo": {
                    "name": self.name,
                    "version": self.version
                }
            }
        }

    async def _handle_tools_list(self, request_id: Any) -> Dict[str, Any]:
        """List available tools"""
        tools = [
            {
                "name": "get_recent_logs",
                "description": "Get recent logs from WeChat DevTools with optional filtering by log level",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "count": {
                            "type": "number",
                            "description": "Number of recent logs to retrieve",
                            "default": 10
                        },
                        "level": {
                            "type": "string",
                            "enum": ["DEBUG", "INFO", "WARN", "ERROR", "ALL"],
                            "description": "Minimum log level to include",
                            "default": "INFO"
                        }
                    }
                }
            },
            {
                "name": "health_check",
                "description": "Check the health status of the MCP server and log system components",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "additionalProperties": False
                }
            },
            {
                "name": "search_logs",
                "description": "Search logs for specific text patterns",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Text to search for in log messages"
                        },
                        "level": {
                            "type": "string",
                            "enum": ["DEBUG", "INFO", "WARN", "ERROR", "ALL"],
                            "description": "Log level filter",
                            "default": "ALL"
                        },
                        "limit": {
                            "type": "number",
                            "description": "Maximum number of results",
                            "default": 50
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "get_error_summary",
                "description": "Get a summary of recent errors and warnings",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "hours": {
                            "type": "number",
                            "description": "Number of hours to look back",
                            "default": 24
                        }
                    }
                }
            }
        ]
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"tools": tools}
        }

    async def _handle_tools_call(self, request_id: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Handle tool calls"""
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        
        logger.info(f"Tool call: {tool_name} with args: {arguments}")
        
        if tool_name == "get_recent_logs":
            result = await self._get_recent_logs(arguments)
        elif tool_name == "search_logs":
            result = await self._search_logs(arguments)
        elif tool_name == "get_error_summary":
            result = await self._get_error_summary(arguments)
        elif tool_name == "health_check":
            result = await self._health_check(arguments)
        else:
            return self._error_response(request_id, -32601, f"Unknown tool: {tool_name}")
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"content": [{"type": "text", "text": result}]}
        }

    async def _handle_prompts_list(self, request_id: Any) -> Dict[str, Any]:
        """List available prompts"""
        prompts = [
            {
                "name": "analyze_logs",
                "description": "Analyze WeChat development logs for issues and patterns"
            },
            {
                "name": "debug_session", 
                "description": "Start a debugging session with recent error logs"
            }
        ]
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"prompts": prompts}
        }

    async def _handle_prompts_get(self, request_id: Any, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get a specific prompt"""
        prompt_name = params.get("name")
        arguments = params.get("arguments", {})
        
        if prompt_name == "analyze_logs":
            recent_logs = await self._get_recent_logs({"count": 20, "level": "WARN"})
            prompt_text = f"""Please analyze these recent WeChat development logs for potential issues:

{recent_logs}

Look for:
1. Error patterns or frequent issues
2. Performance problems  
3. API call failures
4. UI/UX related warnings
5. Suggest debugging steps"""
            
        elif prompt_name == "debug_session":
            error_summary = await self._get_error_summary({"hours": 2})
            prompt_text = f"""Let's start a debugging session. Here's what I found in the last 2 hours:

{error_summary}

Please help me:
1. Prioritize which issues to tackle first
2. Suggest potential root causes
3. Recommend debugging approaches"""
            
        else:
            return self._error_response(request_id, -32601, f"Unknown prompt: {prompt_name}")
        
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {
                "description": f"Generated prompt for {prompt_name}",
                "messages": [
                    {
                        "role": "user", 
                        "content": {"type": "text", "text": prompt_text}
                    }
                ]
            }
        }

    async def _get_recent_logs(self, args: Dict[str, Any]) -> str:
        """Get recent logs from the log file"""
        count = args.get("count", 10)
        level_filter = args.get("level", "INFO").upper()
        
        try:
            if not LOG_FILE_PATH.exists():
                return "📋 Log file not found. Make sure:\n1. Log collection server is running (make start)\n2. WeChat Mini-App is sending logs\n3. Check path: " + str(LOG_FILE_PATH)
            
            logs = []
            min_level = LOG_LEVELS.get(level_filter, 2) if level_filter != "ALL" else 0
            
            with open(LOG_FILE_PATH, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            # Process lines in reverse to get most recent first
            for line in reversed(lines):
                if len(logs) >= count:
                    break
                try:
                    log_entry = json.loads(line.strip())
                    log_level = log_entry.get("level", "INFO").upper()
                    log_level_num = LOG_LEVELS.get(log_level, 2)
                    
                    if log_level_num >= min_level:
                        logs.append(log_entry)
                except json.JSONDecodeError:
                    continue
            
            if not logs:
                return f"📋 No logs found matching level {level_filter} or higher.\n\nTry:\n- Lower the log level filter\n- Check if logs are being sent from WeChat app\n- Run 'make status' to check services"
            
            # Format the logs nicely
            formatted_logs = []
            for log in reversed(logs):  # Reverse again to show chronological order
                timestamp = log.get("timestamp", "Unknown time")
                level = log.get("level", "INFO").upper()
                
                # Handle both message and arguments fields
                if "message" in log:
                    message = log.get("message")
                elif "arguments" in log:
                    args_list = log.get("arguments", [])
                    message = " ".join(str(arg) for arg in args_list)
                else:
                    message = str(log)
                
                formatted_logs.append(f"[{timestamp}] {level}: {message}")
            
            return f"📋 Found {len(formatted_logs)} recent logs:\n\n" + "\n".join(formatted_logs)
            
        except Exception as e:
            logger.error(f"Error reading logs: {e}")
            return f"❌ Error reading logs: {str(e)}"

    async def _search_logs(self, args: Dict[str, Any]) -> str:
        """Search logs for specific text"""
        query = args.get("query", "")
        level_filter = args.get("level", "ALL").upper()
        limit = args.get("limit", 50)
        
        try:
            if not LOG_FILE_PATH.exists():
                return "📋 Log file not found. Make sure the log collection server is running."
            
            matches = []
            min_level = LOG_LEVELS.get(level_filter, 0) if level_filter != "ALL" else 0
            
            with open(LOG_FILE_PATH, "r", encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    if len(matches) >= limit:
                        break
                    try:
                        log_entry = json.loads(line.strip())
                        log_level = log_entry.get("level", "INFO").upper()
                        log_level_num = LOG_LEVELS.get(log_level, 2)
                        
                        if log_level_num >= min_level:
                            # Search in message or arguments
                            if "message" in log_entry:
                                searchable = log_entry.get("message", "")
                            elif "arguments" in log_entry:
                                args_list = log_entry.get("arguments", [])
                                searchable = " ".join(str(arg) for arg in args_list)
                            else:
                                searchable = str(log_entry)
                            
                            if query.lower() in searchable.lower():
                                timestamp = log_entry.get("timestamp", "Unknown")
                                level = log_entry.get("level", "INFO").upper()
                                matches.append(f"Line {line_num} [{timestamp}] {level}: {searchable}")
                    except json.JSONDecodeError:
                        continue
            
            if not matches:
                return f"🔍 No logs found matching '{query}'\n\nTry:\n- Different search terms\n- Broader log level filter\n- Check if logs contain the text you're looking for"
            
            return f"🔍 Found {len(matches)} matching logs:\n\n" + "\n".join(matches)
            
        except Exception as e:
            logger.error(f"Error searching logs: {e}")
            return f"❌ Error searching logs: {str(e)}"

    async def _get_error_summary(self, args: Dict[str, Any]) -> str:
        """Get summary of recent errors and warnings"""
        hours = args.get("hours", 24)
        
        try:
            if not LOG_FILE_PATH.exists():
                return "📋 Log file not found."
            
            errors = []
            warnings = []
            
            with open(LOG_FILE_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        log_entry = json.loads(line.strip())
                        level = log_entry.get("level", "INFO").upper()
                        
                        # Get message from various fields
                        if "message" in log_entry:
                            message = log_entry.get("message")
                        elif "arguments" in log_entry:
                            args_list = log_entry.get("arguments", [])
                            message = " ".join(str(arg) for arg in args_list)
                        else:
                            message = str(log_entry)
                        
                        if level == "ERROR" or level == "error":
                            errors.append(message)
                        elif level == "WARN" or level == "warn":
                            warnings.append(message)
                    except json.JSONDecodeError:
                        continue
            
            summary = f"📊 Error Summary (last {hours} hours):\n\n"
            summary += f"🔴 **{len(errors)} Errors found:**\n"
            if errors:
                for i, error in enumerate(errors[-10:], 1):  # Show last 10 errors
                    summary += f"{i}. {error}\n"
            else:
                summary += "  (No errors)\n"
            
            summary += f"\n🟡 **{len(warnings)} Warnings found:**\n"
            if warnings:
                for i, warning in enumerate(warnings[-10:], 1):  # Show last 10 warnings
                    summary += f"{i}. {warning}\n"
            else:
                summary += "  (No warnings)\n"
            
            if not errors and not warnings:
                summary += "\n✅ No errors or warnings found! Your app is running smoothly."
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return f"❌ Error generating summary: {str(e)}"

    async def _health_check(self, arguments: Dict[str, Any]) -> str:
        """Check the health of the MCP server and related components"""
        try:
            # Try to import requests, but don't fail if not available
            try:
                import requests
                has_requests = True
            except ImportError:
                has_requests = False
                logger.warning("requests library not available, skipping log server check")
            
            uptime = asyncio.get_event_loop().time() - self.start_time if self.start_time else 0
            health_status = {
                "mcp_server": {"status": "healthy", "uptime": f"{uptime:.2f}s"},
                "request_stats": {"total": self.request_count, "errors": self.error_count},
                "log_file": {"path": str(LOG_FILE_PATH), "status": "unknown"},
                "log_server": {"url": "http://127.0.0.1:3001/health", "status": "unknown"}
            }
            
            # Check log file accessibility
            try:
                if LOG_FILE_PATH.exists():
                    if os.access(LOG_FILE_PATH, os.R_OK):
                        health_status["log_file"]["status"] = "readable"
                        stat = os.stat(LOG_FILE_PATH)
                        health_status["log_file"]["size"] = f"{stat.st_size} bytes"
                        health_status["log_file"]["lines"] = sum(1 for _ in open(LOG_FILE_PATH, 'r'))
                    else:
                        health_status["log_file"]["status"] = "permission_denied"
                else:
                    health_status["log_file"]["status"] = "not_found"
            except Exception as e:
                health_status["log_file"]["status"] = f"error: {str(e)}"
            
            # Check log server health (if requests available)
            if has_requests:
                try:
                    response = requests.get("http://127.0.0.1:3001/health", timeout=5)
                    if response.status_code == 200:
                        health_status["log_server"]["status"] = "healthy"
                        health_status["log_server"]["details"] = response.json()
                    else:
                        health_status["log_server"]["status"] = f"unhealthy (HTTP {response.status_code})"
                except requests.exceptions.ConnectionError:
                    health_status["log_server"]["status"] = "connection_refused"
                except Exception as e:
                    health_status["log_server"]["status"] = f"error: {str(e)}"
            else:
                health_status["log_server"]["status"] = "not_checked (requests library not available)"
            
            # Determine overall health
            overall_status = "healthy"
            if health_status["log_file"]["status"] not in ["readable"]:
                overall_status = "degraded"
            if has_requests and health_status["log_server"]["status"] not in ["healthy"]:
                overall_status = "degraded"
            if self.error_count > 0:
                overall_status = "degraded"
            
            # Format response
            result = f"🏥 **System Health Check**\n\n"
            result += f"**Overall Status**: {'✅' if overall_status == 'healthy' else '⚠️'} {overall_status.upper()}\n\n"
            
            result += f"**📊 MCP Server**\n"
            result += f"- Status: ✅ {health_status['mcp_server']['status']}\n"
            result += f"- Uptime: {health_status['mcp_server']['uptime']}\n"
            result += f"- Requests: {health_status['request_stats']['total']} total, {health_status['request_stats']['errors']} errors\n\n"
            
            result += f"**📁 Log File**\n"
            result += f"- Path: {health_status['log_file']['path']}\n"
            status_icon = "✅" if health_status['log_file']['status'] == 'readable' else "❌"
            result += f"- Status: {status_icon} {health_status['log_file']['status']}\n"
            if "size" in health_status['log_file']:
                result += f"- Size: {health_status['log_file']['size']}\n"
            if "lines" in health_status['log_file']:
                result += f"- Lines: {health_status['log_file']['lines']}\n"
            
            result += f"\n**🌐 Log Collection Server**\n"
            result += f"- URL: {health_status['log_server']['url']}\n"
            status_icon = "✅" if health_status['log_server']['status'] == 'healthy' else "❌"
            result += f"- Status: {status_icon} {health_status['log_server']['status']}\n"
            if "details" in health_status['log_server']:
                details = health_status['log_server']['details']
                result += f"- Uptime: {details.get('uptime', 0)/1000:.2f}s\n"
                result += f"- Requests: {details.get('requestCount', 0)}, Errors: {details.get('errorCount', 0)}\n"
            
            if self.last_error:
                result += f"\n**🔴 Last Error**: {self.last_error}\n"
            
            return result
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return f"❌ Health check failed: {str(e)}"

    def _error_response(self, request_id: Any, code: int, message: str) -> Dict[str, Any]:
        """Create an error response"""
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "error": {"code": code, "message": message}
        }


async def main():
    """Main MCP server loop"""
    server = WeChatMCPServer()
    
    logger.info(f"🚀 {server.name} v{server.version} starting...")
    logger.info(f"📁 Monitoring log file: {LOG_FILE_PATH}")
    logger.info("📡 Ready to receive MCP requests via stdio")
    
    # Read requests from stdin and write responses to stdout
    while True:
        try:
            line = await asyncio.to_thread(sys.stdin.readline)
            if not line:
                logger.info("EOF received, shutting down")
                break
            
            request = json.loads(line.strip())
            response = await server.handle_request(request)
            
            # Write response to stdout (MCP communication channel)
            print(json.dumps(response), flush=True)
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON received: {e}")
            continue
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received, shutting down")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            continue
    
    logger.info("MCP server shutdown complete")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutdown requested")
        sys.exit(0)
