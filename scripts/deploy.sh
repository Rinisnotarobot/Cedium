#!/bin/bash

# Cedium 部署脚本
# 用法: ./deploy.sh

set -e

# 配置
PROJECT_DIR="/opt/Cedium"
CONTAINER_NAME="cedium"
IMAGE_NAME="cedium:latest"
ENV_FILE="/opt/Cedium/.env.prod"
PORT=3000

echo "=========================================="
echo "Cedium 部署脚本"
echo "=========================================="

# 进入项目目录
cd "$PROJECT_DIR"

# 拉取最新代码
echo "[1/5] 拉取最新代码..."
git fetch origin
git reset --hard origin/master
echo "代码已更新到最新版本"

# 停止容器
echo "[2/5] 停止旧容器..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop "$CONTAINER_NAME" || true
    echo "容器已停止"
else
    echo "容器不存在，跳过停止"
fi

# 删除容器
echo "[3/5] 删除旧容器..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker rm "$CONTAINER_NAME" || true
    echo "容器已删除"
else
    echo "容器不存在，跳过删除"
fi

# 构建镜像
echo "[4/5] 构建新镜像..."
docker build --no-cache -t "$IMAGE_NAME" .
echo "镜像构建完成"

# 启动容器
echo "[5/5] 启动新容器..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart always \
    -p "$PORT:$PORT" \
    --env-file "$ENV_FILE" \
    "$IMAGE_NAME"

echo "=========================================="
echo "部署完成!"
echo "容器: $CONTAINER_NAME"
echo "镜像: $IMAGE_NAME"
echo "端口: $PORT"
echo "=========================================="

# 显示容器状态
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"