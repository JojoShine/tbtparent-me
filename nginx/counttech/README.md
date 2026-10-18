# CountTech 企业官网

南通数可信息技术有限公司静态官网：https://www.counttech.cloud/

## 文件

- `index.html`：六项能力、业务场景、交付承诺与联系方式；原生锚点导航、栏目高亮、微信复制。
- `assets/site.css`：桌面、平板和手机布局，遵循减少动态效果的系统偏好。
- `assets/counttech-logo.png`：用户提供的原始 Logo。
- `assets/hero.jpg`：使用内置 imagegen 生成的主视觉，压缩为 JPEG。本图生成要求：深海军蓝企业网站背景，左侧留白，右侧精细蓝灰建筑线框与少量半透明平面，无文字、无标志。
- `assets/lucide-LICENSE`：内联 Lucide 图标许可，来源 lucide-static 0.468.0。
- `company-website.conf`：官网 Nginx 片段。

## 部署

页面与 assets 部署至 `/srv/www/company-website/`，Nginx 片段部署至 `/etc/nginx/business/counttech.cloud/company-website.conf`。保留现有共享 `/images/` 路由以及其他业务片段。HTML 与资源使用 `Cache-Control: no-cache`，保证更新后重新验证缓存。

部署前将原目录和配置备份到 `/data/backups/counttech/website-<时间>/`，先执行 `nginx -t`，通过后 reload。上线后校验首页和三个资源的内容一致性，并检查 `/project-manager/` 停服提示及 `https://tbtparent.me/healthz`。

回滚时将备份 `website/` 的文件还原至官网目录，将备份配置还原至原路径，配置验证通过后 reload。

联系方式由用户指定：counttech@163.com、微信 13813975440。备案链接为苏ICP备2023016599号-1，指向工信部备案网站。
