# tbtparent-me

个人站，使用 Next.js 16、React 19、Prisma、外部 PostgreSQL 和 MinIO。

## 本地开发

使用 Node.js 22.23.3 或更新的兼容版本：

```sh
npm ci
cp .env.example .env
# 配置开发数据库和 MinIO，然后显式迁移、初始化。
npx prisma generate
npx prisma migrate deploy
node prisma/bootstrap.js
npm run dev
```

`prisma/bootstrap.js` 只创建缺失的首页与关于页基础记录，不导入示例作品、不覆盖已有内容。历史 `prisma/seed.js` 会写入演示数据，不用于生产初始化。

```sh
npm test
bash deploy/build.sh
bash deploy/verify-image.sh tbtparent-me:local
```

## 生产部署

使用 Docker 和 GHCR。完整操作步骤、旧 PM2 迁移、备份和回滚见 [DEPLOYMENT.md](DEPLOYMENT.md)。部署约定来源：[deploy-standards](https://github.com/JojoShine/deploy-standards/blob/main/DEPLOYMENT.md)，本次对齐版本 `e797017c869dadf9cc994f4aea9e4d97eea38e01`。

GitHub Actions 对 PR 执行检查及隔离数据库镜像验收；main 发布已验收的完整 SHA 标签；`vX.Y.Z` 发布提升同一镜像摘要并附带匹配部署文件。服务器只拉镜像，不构建源码。
