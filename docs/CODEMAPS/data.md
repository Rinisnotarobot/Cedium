<!-- Generated: 2026-05-26 | Files scanned: 251 | Token estimate: ~650 -->

# Data Architecture

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Session   │     │   Account   │
│             │     │             │     │             │
│ id (PK)     │     │ userId (FK) │────<│ userId (FK) │
│ email       │     │ token       │     │ providerId  │
│ name        │     │ expiresAt   │     │ password    │
│ image       │     └─────────────┘     └─────────────┘
│ bio         │
│ emailVerified│     ┌─────────────┐
│ draftCount  │────<│ Verification│
└─────────────┘     │             │
      │             │ identifier  │
      │             │ value       │
      │             │ expiresAt   │
      │             └─────────────┘
      │
      │ ┌─────────────┐     ┌─────────────┐
      ├─<│   Article   │────<│ ArticleTag  │>─────┌─────────────┐
      │ │             │     │             │      │    Tag      │
      │ │ id (PK)     │     │ articleId   │      │             │
      │ │ title       │     │ tagId       │      │ id (PK)     │
      │ │ slug        │     └─────────────┘      │ name        │
      │ │ content     │                          │ slug        │
      │ │ status      │                          └─────────────┘
      │ │ authorId    │
      │ │ likeCount   │     ┌─────────────┐
      │ │ bookmarkCnt │────<│   Bookmark  │
      │ │ commentCnt  │     │             │
      │ └─────────────┘     │ userId (FK) │
      │       │             │ articleId   │
      │       │             └─────────────┘
      │       │
      │       │     ┌─────────────┐
      │       ├────<│    Like     │
      │       │     │             │
      │       │     │ userId (FK) │
      │       │     │ articleId   │
      │       │     └─────────────┘
      │       │
      │       │     ┌─────────────┐     ┌─────────────┐
      │       ├────<│   Comment   │────<│ CommentLike │
      │       │     │             │     │             │
      │       │     │ id (PK)     │     │ userId (FK) │
      │       │     │ articleId   │     │ commentId   │
      │       │     │ userId      │     └─────────────┘
      │       │     │ parentId    │ (嵌套回复)
      │       │     │ likeCount   │
      │       │     └─────────────┘
      │
      │ ┌─────────────┐
      ├─<│   Follow    │ (自引用关系)
      │ │             │
      │ │ followerId  │ → User (following)
      │ │ followingId │ → User (followers)
      │ └─────────────┘
```

## Models (Prisma Generated)

```
src/generated/prisma/models/
├── User.ts          (175 symbols) - 用户核心
├── Article.ts       (134 symbols) - 文章内容
├── Comment.ts       (144 symbols) - 评论系统
├── Session.ts       (79 symbols)  - 会话管理
├── Account.ts       (80 symbols)  - 认证账户
├── Bookmark.ts      (95 symbols)  - 收藏
├── Like.ts          (95 symbols)  - 点赞
├── CommentLike.ts   (95 symbols)  - 评论点赞
├── Follow.ts        (95 symbols)  - 关注关系
├── Tag.ts           (76 symbols)  - 标签
├── ArticleTag.ts    (95 symbols)  - 文章标签关联
└── Verification.ts  (58 symbols)  - 验证记录
```

## Article Status Enum

```typescript
enum ArticleStatus {
  DRAFT      // 草稿 - 仅作者可见
  PUBLISHED  // 已发布 - 公开可见
  ARCHIVED   // 已归档 - 仅作者可见，从列表隐藏
}
```

## Key Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| Article | authorId, status, publishedAt | 查询优化 |
| Article | likeCount, commentCount | 排序优化 |
| Comment | articleId, parentId, createdAt | 嵌套评论查询 |
| Follow | followerId, followingId | 关系查询 |
| User | email (unique) | 登录查询 |

## Denormalized Count Fields

文章表存储了反规范化的计数字段，用于优化查询性能:
- `likeCount` - 点赞数
- `bookmarkCount` - 收藏数
- `commentCount` - 评论数
- `User.draftCount` - 草稿数
- `Comment.likeCount` - 评论点赞数