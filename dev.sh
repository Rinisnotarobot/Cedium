#!/bin/bash

# 查找并清除占用 3000 端口的进程
PORT=3000
PROCESS=$(lsof -t -i:$PORT 2>/dev/null)

if [ -n "$PROCESS" ]; then
  echo "发现进程占用端口 $PORT (PID: $PROCESS)"
  kill -9 $PROCESS
  echo "已清除进程"
fi

# 启动开发服务器
pnpm dev