# 阶段 1: 构建
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client (直接调用 prisma generate，绕过 dotenv-cli)
RUN pnpm exec prisma generate

# 复制源码
COPY . .

# 生产构建
RUN pnpm build

# 阶段 2: 生产运行
FROM node:22-alpine AS runner

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 只复制生产所需文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/.output ./output
COPY --from=builder /app/src/generated ./src/generated

# 安装生产依赖 (Prisma adapter 需要)
RUN pnpm install --prod --frozen-lockfile

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 启动 Nitro 服务
CMD ["node", "output/server/index.mjs"]