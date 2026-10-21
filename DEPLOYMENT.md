# tbtparent-me Docker 部署

对齐 [部署约定](https://github.com/JojoShine/deploy-standards/blob/e797017c869dadf9cc994f4aea9e4d97eea38e01/DEPLOYMENT.md)。本流程使用单一镜像 `ghcr.io/jojoshine/tbtparent-me`，应用、迁移和初始化均固定同一摘要。应用监听 `0.0.0.0:8080`；根路径部署，`BASE_PATH` 必须为空。当前不发布路径前缀变体。

## 发布与镜像

PR 验证锁定依赖、测试、生产 Compose、镜像构建、隔离 PostgreSQL 的完整迁移、重复初始化、应用启动及数据库故障下健康检查。构建不需要任何生产环境变量；首页、作品页与 sitemap 的数据库查询在请求时发生。

main CI 将已验收的原镜像发布为 `sha-<完整SHA>`。已有提交标签不覆盖，重试时按原摘要重新验收。正式发布前确认 main CI 全部成功，再对该提交创建 `vX.Y.Z` 标签并推送；Release 工作流核对提交属于 main 且对应 CI 成功，提升同一 digest，不重新构建。已有版本标签仅在摘要完全相同时复用，摘要不同立即停止；已发布 Release 不覆盖。如果镜像标签提升成功但 Release 创建失败，可重跑该工作流继续创建 Release。CI 重跑时若 candidate 已存在，核对原镜像来源与提交并重新验收原镜像，不覆盖标签。main 发布流程不因新提交取消；PR 检查可取消过时运行。

GitHub Release 附带 `compose.prod.yaml`、`.env.prod.example`、`business.conf.example`、本文及 `version.txt`。始终从同一 Release 获取这些文件，不从 main 拼接旧镜像。正式镜像平台为 `linux/amd64`，服务器需 x86_64；本地可构建原生 ARM64 验证镜像。

检查 GHCR 包实际可见性。公开包可匿名拉取；私有包使用专用 `read:packages` 凭据，通过 `docker login ghcr.io --password-stdin` 登录，不把凭据写入仓库或命令参数。发布工作流不会自动修改包可见性，也不会 SSH 到生产服务器。

## 首次准备

安装 Docker Engine、Compose v2（支持 `up --wait`）、宿主机 Nginx 和 PostgreSQL 客户端。继续使用现有外部 PostgreSQL 和 MinIO，不启动新的生产数据库容器。

业务目录固定 `/opt/tbtparent-me`，环境文件 `.env.prod` 权限 `600`，Compose 项目名固定 `tbtparent-me-production`。创建 `backups/`；数据库备份同样限制读取权限。示例端口分配为 **31000**，首次切换前在服务器检查该端口与其他项目登记均无冲突。旧 PM2 端口为 **5001**；部署本仓库不自动改写线上端口。

把 Release 的 `.env.prod.example` 复制为 `.env.prod` 并填写配置，保留 Release 已填入的 `APP_IMAGE=...@sha256:...`。只设置一个 APP_IMAGE。不要 `source` 或 `eval` 环境文件；使用 Compose 的 `--env-file`。

应用角色只授予数据库连接、public schema USAGE、业务表 SELECT/INSERT/UPDATE/DELETE 和序列 USAGE/SELECT，不授予 CREATE/ALTER/DROP。迁移角色需要 schema DDL、`_prisma_migrations` 和数据迁移/初始化所需权限。后续迁移创建表时配置对应 owner 的默认表/序列权限，确保应用角色可读取新表。迁移和初始化仅接收 MIGRATION_DATABASE_URL，应用不接收迁移凭据。

容器中的 localhost 指向自身。访问宿主机 PostgreSQL/MinIO 可使用 `host.docker.internal`（Compose 已配置 host-gateway），同时按实际 Docker 子网配置 PostgreSQL `listen_addresses` / `pg_hba.conf` 和防火墙。也可使用已有服务的可达域名。分别验证运行角色和迁移角色权限，不能只测试连接。

管理认证继续由 `.env.prod` 的 ADMIN_SECRET 提供；当前没有数据库账号初始化或单独初始化密码，不需要 `.env.bootstrap`。不要在发布时旋转已有 ADMIN_SECRET。

## 已有数据库的一次性基线登记

历史仓库缺少创建原始表的迁移，新加入 `20260901000000_initial_schema` 使空数据库可以完整重放。**已有数据库不能直接运行新版本 migrate**，否则会重复建表；也不能未检查就标记迁移。

先用已有版本备份数据库和迁移记录，在隔离恢复副本验证。拉取本次 Release 的同一摘要镜像后，仅检查当前数据库结构是否与该镜像 schema 完全一致：

```sh
docker compose --env-file .env.prod -f compose.prod.yaml run --rm --no-deps migrate \
  sh -c 'exec node node_modules/prisma/build/index.js migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code'
```

退出码 **0** 表示无差异；**2** 表示结构不一致，停止并单独核对缺失字段、历史迁移、角色和手工变更，不执行 reset、db push 或全量 seed。确认现有增量迁移都已执行且 schema 一致后，仅登记缺失的初始基线：

```sh
docker compose --env-file .env.prod -f compose.prod.yaml run --rm --no-deps migrate \
  node node_modules/prisma/build/index.js migrate resolve --applied 20260901000000_initial_schema
```

此命令只写迁移记录，不改业务表。然后运行正常 migrate；已登记的历史迁移不会重放。若旧库还缺少后续增量迁移，应先在隔离恢复副本制定并验证对应登记/升级顺序。空数据库跳过上述登记，直接正常迁移。

## 每次升级

顺序固定：**核对版本 → 备份数据库与当前配置 → 拉取镜像 → 迁移 → 启动 → 检查健康**。以下在 `/opt/tbtparent-me` 逐步执行；任何一步失败即停止。

统一作品入口的 `20261021000000_unify_project_entrypoints` 迁移新增移动端与 PC 端链接：原移动项目的演示链接归入移动端，其余项目的演示链接归入 PC 端；已有后台链接优先作为 PC 端入口，二维码附件保持不变。先执行迁移再启动新版本。此后在作品管理中维护“移动端入口链接 / 二维码”和“PC 端入口链接”，页面按填写情况展示，不依赖项目类型或访问设备。旧字段保留以支持旧版本回滚。

核对 version.txt 中提交、平台和 digest，与 .env.prod 的 APP_IMAGE 相同。先保存当前与上一版本 Compose、环境、Nginx 片段和 version.txt。通过组织批准的 PostgreSQL 凭据文件（例如权限 600 的 .pgpass）使用 pg_dump -Fc 备份实际业务库；检查退出码及 `pg_restore --list`，定期在隔离库演练恢复。备份、凭据和配置不要加入 Git。

```sh
docker compose --env-file .env.prod -f compose.prod.yaml pull
docker compose --env-file .env.prod -f compose.prod.yaml run --rm --no-deps migrate
# 只有迁移成功才执行：
docker compose --env-file .env.prod -f compose.prod.yaml up -d --no-build --wait app
docker compose --env-file .env.prod -f compose.prod.yaml ps
curl --fail https://tbtparent.me/healthz
```

全新数据库首次成功后，如需基础首页记录，再显式初始化：

```sh
docker compose --env-file .env.prod -f compose.prod.yaml run --rm --no-deps migrate /app/bin/bootstrap
```

初始化只补充缺失的 Home/About 单例，重复执行保留既有内容；生产已有内容无需初始化。不自动导入演示作品或示例账号，不运行历史 seed。应用启动时不执行迁移或初始化。默认镜像命令为应用，覆盖 command 可正确运行独立运维入口。

## 从 PM2 切换及 Nginx

先保留 PM2 在 5001 运行，将容器单独在 31000 拉起并检查 `curl --fail http://127.0.0.1:31000/healthz`。还要验证首页、作品、后台登录、MinIO 图片、文件下载及已有其他业务路径。

根站点片段安装为 `/etc/nginx/business/tbtparent.me/tbtparent-me.conf`，内容取同一 Release 的 `business.conf.example`。在现有 HTTPS server 中只保留一次 `include /etc/nginx/business/tbtparent.me/*.conf;`；已有该 include 时直接复用，不再创建另一份目录或 include。保留现有域名、证书和 HTTP→HTTPS 跳转。

原站点 `location /`、`/_next/static/`、`/assets/`、`/api/` 若仍转发 5001，应在保存原配置后替换为新根片段或逐条核对并改到 31000。不能重复 location，也不能重复 include。保留 `/surveys`、`/owl` 等其他业务的独立 location；它们优先于根路径。原有 404 落地页策略留在宿主机，根据实际站点配置核对，不自动覆盖。

```sh
sudo nginx -t && sudo systemctl reload nginx
curl --fail https://tbtparent.me/healthz
```

确认公网及其他业务正常后再停止旧 PM2 进程；保留原部署目录及启动配置直到回滚窗口结束。旧 deploy/nginx.conf 和 ecosystem.config.cjs 仅作 PM2 回滚参考，不再作为新部署入口。以后仅镜像升级通常不改 Nginx。

旧入口 `https://www.counttech.cloud/project-manager/` 的停服提示由宿主机单独维护：`nginx/project-manager-redirect.html` 安装到 `/srv/www/project-manager-retired.html`，`nginx/project-manager-retired.conf` 安装到 `/etc/nginx/business/counttech.cloud/project-manager.conf`。复用该域名原有的 include，备份后检查 Nginx 配置并重载，无需重建应用镜像。旧入口及子页面显示 5 秒倒计时，可暂停、继续或立即前往 `https://tbtparent.me/flowcraft/`；不转发旧路径和参数，旧表单提交返回 410。未启用 JavaScript 时保留普通跳转链接。

## 回滚与日常运维

迁移失败不替换旧应用。容器启动或健康失败，恢复上一版本 Compose 与 APP_IMAGE digest，然后 `up -d --no-build --wait app`，重新检查健康。首次 PM2 切换失败则恢复原 Nginx 并检查后恢复 PM2。应用回滚不会自动回滚数据库；迁移应先加结构、后切应用、另发版本删旧结构。破坏性变更需另行安排数据库恢复。

镜像中保留精确迁移工具，不需服务器安装 Node/npm 或源码。healthz 检查应用 HTTP 和必要数据库连接，失败返回 503，不输出连接详情；不要求 MinIO 服务参与探活。应用文件/上传继续写外部 MinIO；单实例 Next 缓存放在容器内，容器重建后重新生成，不挂载源码。Compose 对容器日志按 10MB × 3 轮转，运维仍需维护备份保留、镜像/磁盘清理及证书续期。默认单实例替换允许短暂中断，不宣称零停机。
