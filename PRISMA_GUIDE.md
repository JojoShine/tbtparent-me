# Prisma ORM 快速指南（Sequelize 用户迁移参考）

## 核心概念对比

| 概念 | Sequelize | Prisma |
|------|-----------|--------|
| 模型定义 | `sequelize.define()` / class | `prisma/schema.prisma` 文件 |
| 数据库迁移 | `sequelize-cli migration` | `npx prisma migrate dev` |
| 客户端实例 | `new Sequelize()` | `new PrismaClient()` |
| 同步表结构 | `sequelize.sync()` | `npx prisma db push` |
| 种子数据 | `seeders/` 目录 | `prisma/seed.js` |
| 可视化工具 | 无官方 | `npx prisma studio` |

## 常用命令

```bash
# 可视化查看/编辑数据（强烈推荐，类似 pgAdmin）
npx prisma studio

# 推送 schema 到数据库（不改迁移文件，快速同步）
npx prisma db push

# 创建迁移文件并执行（正式环境用）
npx prisma migrate dev --name init

# 重新生成客户端代码（改了 schema.prisma 后执行）
npx prisma generate

# 执行种子脚本
npx prisma db seed
```

## CRUD 操作对比

### 查询 (SELECT)

```javascript
// Sequelize
const users = await User.findAll({ where: { age: { [Op.gte]: 18 } } })
const user = await User.findByPk(1)
const user = await User.findOne({ where: { email: 'a@b.com' } })

// Prisma
const users = await prisma.user.findMany({ where: { age: { gte: 18 } } })
const user = await prisma.user.findUnique({ where: { id: 1 } })
const user = await prisma.user.findFirst({ where: { email: 'a@b.com' } })
```

### 创建 (INSERT)

```javascript
// Sequelize
await User.create({ name: 'Tom', age: 25 })
await User.bulkCreate([{ name: 'A' }, { name: 'B' }])

// Prisma
await prisma.user.create({ data: { name: 'Tom', age: 25 } })
await prisma.user.createMany({ data: [{ name: 'A' }, { name: 'B' }] })
```

### 更新 (UPDATE)

```javascript
// Sequelize
await User.update({ name: 'Jerry' }, { where: { id: 1 } })

// Prisma
await prisma.user.update({ where: { id: 1 }, data: { name: 'Jerry' } })

// Prisma: upsert（不存在则创建）
await prisma.user.upsert({
  where: { id: 1 },
  update: { name: 'Jerry' },
  create: { id: 1, name: 'Jerry', age: 25 },
})
```

### 删除 (DELETE)

```javascript
// Sequelize
await User.destroy({ where: { id: 1 } })

// Prisma
await prisma.user.delete({ where: { id: 1 } })
await prisma.user.deleteMany({ where: { age: { lt: 18 } } })
```

### 关联查询 (JOIN)

```javascript
// Sequelize
const posts = await Post.findAll({ include: [User] })

// Prisma
const posts = await prisma.post.findMany({ include: { author: true } })
// 只查关联
const posts = await prisma.post.findMany({ select: { title: true, author: { select: { name: true } } } })
```

### 过滤与排序

```javascript
// Prisma 过滤操作符
{ gt: 10 }     // > 10    (Sequelize: [Op.gt])
{ gte: 10 }    // >= 10   (Sequelize: [Op.gte])
{ lt: 10 }     // < 10    (Sequelize: [Op.lt])
{ lte: 10 }    // <= 10   (Sequelize: [Op.lte])
{ not: 10 }    // != 10   (Sequelize: [Op.ne])
{ in: [1,2] }  // IN      (Sequelize: [Op.in])
{ contains: 'abc' }  // LIKE '%abc%'  (Sequelize: [Op.like])

// 排序
{ orderBy: { createdAt: 'desc' } }
// 多字段排序
{ orderBy: [{ age: 'desc' }, { name: 'asc' }] }

// 分页
{ skip: 20, take: 10 }  // OFFSET 20 LIMIT 10
```

## Schema 定义语法

```prisma
model Blog {
  id        Int      @id @default(autoincrement())  // 自增主键
  title     String                                   // VARCHAR
  content   String   @db.Text                        // TEXT 类型
  slug      String   @unique                         // 唯一约束
  published Boolean  @default(false)                 // 默认值
  author    User     @relation(...)                  // 关联
  tags      String[]                                 // 数组（PostgreSQL）
  createdAt DateTime @default(now())                 // 自动时间戳
  updatedAt DateTime @updatedAt                      // 自动更新时间
}
```

## 在 Next.js 中使用

```javascript
// src/lib/prisma.js - 单例模式（避免热重载创建多个连接）
import { PrismaClient } from '@/generated/prisma'
const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 在 API Route 中使用
import { prisma } from '@/lib/prisma'
export async function GET() {
  const data = await prisma.blog.findMany()
  return Response.json(data)
}
```

## 与 Sequelize 的关键差异

1. **类型安全**：Prisma 生成的客户端有完整 TypeScript 类型提示
2. **无 Op 枚举**：过滤操作符直接写 `{ gte: 10 }` 而非 `{ [Op.gte]: 10 }`
3. **事务写法**：
   ```javascript
   // Prisma
   await prisma.$transaction([
     prisma.user.create({ data: { name: 'A' } }),
     prisma.post.create({ data: { title: 'B' } }),
   ])
   ```
4. **原始 SQL**：
   ```javascript
   const result = await prisma.$queryRaw`SELECT * FROM users WHERE age > 18`
   ```
