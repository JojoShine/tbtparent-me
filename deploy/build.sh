#!/bin/bash
# tbtparent.me 打包脚本
# 使用方式: bash deploy/build.sh
# 输出: deploy/tbtparent-me.tar.gz
# 依赖: Node.js 18+

set -e

APP_NAME="tbtparent-me"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$APP_DIR/deploy"
OUTPUT_FILE="$DEPLOY_DIR/${APP_NAME}.tar.gz"
STANDALONE_DIR="$APP_DIR/.next/standalone"
NODE_ENV="production"

echo "=========================================="
echo "  tbtparent.me 构建打包"
echo "=========================================="
echo ""

# 1. 进入项目目录
cd "$APP_DIR"
echo "[1/6] 项目目录: $APP_DIR"

# 2. 检查 Node.js
echo "[2/6] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未安装 Node.js"
    exit 1
fi
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"

# 3. 安装依赖
echo "[3/6] 安装依赖..."
npm ci --production=false

# 4. 生成 Prisma Client
echo "[4/6] 生成 Prisma Client..."
npx prisma generate

# 5. 构建 Next.js (standalone)
echo "[5/6] 构建 Next.js (standalone)..."
NODE_ENV=$NODE_ENV npm run build

# 6. 打包
echo "[6/6] 打包部署文件..."

# 清理旧的压缩包
rm -f "$OUTPUT_FILE"

# standalone 输出需要复制 static 和 public
cp -r "$APP_DIR/.next/static" "$STANDALONE_DIR/.next/static"
cp -r "$APP_DIR/public" "$STANDALONE_DIR/public"

# 复制 prisma schema（服务器需要 prisma generate）
mkdir -p "$STANDALONE_DIR/prisma"
cp "$APP_DIR/prisma/schema.prisma" "$STANDALONE_DIR/prisma/"

# 复制 deploy 脚本和配置文件
mkdir -p "$STANDALONE_DIR/deploy"
cp "$DEPLOY_DIR/nginx.conf" "$STANDALONE_DIR/deploy/"
cp "$APP_DIR/.env.example" "$STANDALONE_DIR/.env.example"
# 复制 .env（如果存在）
if [ -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env" "$STANDALONE_DIR/.env"
fi
cp "$APP_DIR/ecosystem.config.cjs" "$STANDALONE_DIR/"
# 复制 package-lock.json（npm ci 需要）
cp "$APP_DIR/package-lock.json" "$STANDALONE_DIR/"

# 重命名 standalone 目录为项目名
PACKAGE_DIR="$APP_DIR/.next/${APP_NAME}"
if [ -d "$STANDALONE_DIR" ] && [ "$STANDALONE_DIR" != "$PACKAGE_DIR" ]; then
    rm -rf "$PACKAGE_DIR"
    mv "$STANDALONE_DIR" "$PACKAGE_DIR"
fi

# 创建压缩包（带顶层目录）
cd "$(dirname "$PACKAGE_DIR")"
tar -czf "$OUTPUT_FILE" "$(basename "$PACKAGE_DIR")"

# 文件大小
SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo ""
echo "=========================================="
echo "  打包完成"
echo "  输出文件: deploy/${APP_NAME}.tar.gz ($SIZE)"
echo "=========================================="
echo ""
echo "服务器部署步骤:"
echo "  1. 上传压缩包到服务器"
echo "  2. 解压: mkdir -p /opt/${APP_NAME} && tar -xzf ${APP_NAME}.tar.gz -C /opt/${APP_NAME} --strip-components=1"
echo "  3. 启动: cd /opt/${APP_NAME} && pm2 start ecosystem.config.cjs"
echo "  4. 配置 nginx: sudo cp deploy/nginx.conf /etc/nginx/conf.d/${APP_NAME}.conf"
echo "  5. 重载 nginx: sudo nginx -t && sudo systemctl reload nginx"
echo ""
