import { Card, CardContent } from "#/components/ui/card"
import { Badge } from "#/components/ui/badge"
import { Clock } from "lucide-react"

interface Article {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    avatarColor: string
  }
  createdAt: string
  readTime: number
  tags: string[]
  featured?: boolean
}

const articles: Article[] = [
  {
    id: "1",
    title: "深入理解 React Server Components：架构革命还是渐进优化？",
    excerpt: "RSC 不是简单的服务端渲染升级，它重新定义了组件的数据获取边界和渲染模型。本文探讨 RSC 的核心设计理念、流式渲染机制，以及它如何改变我们构建现代应用的思维方式。",
    author: { name: "陈思远", avatarColor: "bg-violet-500" },
    createdAt: "2024-01-15",
    readTime: 12,
    tags: ["React", "架构"],
    featured: true,
  },
  {
    id: "2",
    title: "TypeScript 5.0 新特性实战：从装饰器到 const type parameters",
    excerpt: "TS 5.0 带来了 ECMAScript 装饰器的正式支持和 const 类型参数。通过实际案例演示这些特性如何在企业级项目中减少样板代码、提升类型推断精度。",
    author: { name: "林浩然", avatarColor: "bg-blue-500" },
    createdAt: "2024-01-12",
    readTime: 8,
    tags: ["TypeScript", "类型系统"],
  },
  {
    id: "3",
    title: "构建高性能 Rust 微服务：从 Tokio 到 gRPC 的完整实践",
    excerpt: "Rust 的零成本抽象让它在微服务场景中表现卓越。本文从 Tokio runtime 配置、异步编程模式到 gRPC 集成，构建一个生产级的 Rust 微服务模板。",
    author: { name: "赵明轩", avatarColor: "bg-orange-500" },
    createdAt: "2024-01-10",
    readTime: 15,
    tags: ["Rust", "微服务"],
  },
  {
    id: "4",
    title: "CSS Container Queries 实战：真正组件级响应式设计",
    excerpt: "Media Queries 响应的是视口，Container Queries 响应的是容器。终于可以构建真正自包含的响应式组件了。探索语法、polyfill 策略和最佳实践。",
    author: { name: "苏雨晴", avatarColor: "bg-emerald-500" },
    createdAt: "2024-01-08",
    readTime: 6,
    tags: ["CSS", "响应式设计"],
  },
  {
    id: "5",
    title: "PostgreSQL 查询优化深度指南：从 EXPLAIN 到索引策略",
    excerpt: "数据库性能问题往往不是 SQL 写得不好，而是索引策略不对。系统分析 EXPLAIN 输出、理解执行计划成本模型，以及 B-tree、GIN、BRIN 索引的选择时机。",
    author: { name: "周子墨", avatarColor: "bg-cyan-500" },
    createdAt: "2024-01-05",
    readTime: 18,
    tags: ["PostgreSQL", "性能优化"],
  },
  {
    id: "6",
    title: "Zustand vs Jotai：轻量级状态管理的两种哲学",
    excerpt: "两者都很轻，但设计理念截然不同。Zustand 是中心化的 store，Jotai 是原子化的 primitive。对比它们在复杂应用中的心智模型和实际表现。",
    author: { name: "吴晓涵", avatarColor: "bg-pink-500" },
    createdAt: "2024-01-03",
    readTime: 7,
    tags: ["状态管理", "React"],
  },
]

function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="hover:shadow-md hover:border-border/80 transition-all cursor-pointer group py-5">
      <CardContent className="px-6">
        <div className="flex gap-5">
            {/* 左侧：作者头像 */}
            <div className="flex-shrink-0 pt-1">
              <div
                className={`size-12 rounded-full ${article.author.avatarColor} flex items-center justify-center text-white font-medium text-sm`}
              >
                {article.author.name.charAt(0)}
              </div>
            </div>

            {/* 右侧：内容 */}
            <div className="flex-1 min-w-0">
              {/* 作者和日期 */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground/80">{article.author.name}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{article.createdAt}</span>
              </div>

              {/* 标题 */}
              <h2 className="font-semibold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h2>

              {/* 摘要 */}
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                {article.excerpt}
              </p>

              {/* 底部：阅读时间 + 标签 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{article.readTime} 分钟阅读</span>
                  {article.featured && (
                    <Badge variant="secondary" className="ml-2">
                      精选
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs px-2">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}

export function ArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">文章</h1>
          <p className="text-muted-foreground mt-1 text-sm">探索技术、架构与工程实践</p>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
}