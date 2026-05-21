import { PageContainer, PageHeader } from "#/components/layout";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Clock, ArrowUpRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatarColor: string;
  };
  createdAt: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
}

const articles: Article[] = [
  {
    id: "1",
    title: "深入理解 React Server Components：架构革命还是渐进优化？",
    excerpt:
      "RSC 不是简单的服务端渲染升级，它重新定义了组件的数据获取边界和渲染模型。本文探讨 RSC 的核心设计理念、流式渲染机制，以及它如何改变我们构建现代应用的思维方式。",
    author: { name: "陈思远", avatarColor: "bg-violet-500" },
    createdAt: "2024-01-15",
    readTime: 12,
    tags: ["React", "架构"],
    featured: true,
  },
  {
    id: "2",
    title: "TypeScript 5.0 新特性实战：从装饰器到 const type parameters",
    excerpt:
      "TS 5.0 带来了 ECMAScript 装饰器的正式支持和 const 类型参数。通过实际案例演示这些特性如何在企业级项目中减少样板代码、提升类型推断精度。",
    author: { name: "林浩然", avatarColor: "bg-blue-500" },
    createdAt: "2024-01-12",
    readTime: 8,
    tags: ["TypeScript", "类型系统"],
  },
  {
    id: "3",
    title: "构建高性能 Rust 微服务：从 Tokio 到 gRPC 的完整实践",
    excerpt:
      "Rust 的零成本抽象让它在微服务场景中表现卓越。本文从 Tokio runtime 配置、异步编程模式到 gRPC 成成，构建一个生产级的 Rust 微服务模板。",
    author: { name: "赵明轩", avatarColor: "bg-orange-500" },
    createdAt: "2024-01-10",
    readTime: 15,
    tags: ["Rust", "微服务"],
  },
  {
    id: "4",
    title: "CSS Container Queries 实战：真正组件级响应式设计",
    excerpt:
      "Media Queries 响应的是视口，Container Queries 响应的是容器。终于可以构建真正自包含的响应式组件了。探索语法、polyfill 策略和最佳实践。",
    author: { name: "苏雨晴", avatarColor: "bg-emerald-500" },
    createdAt: "2024-01-08",
    readTime: 6,
    tags: ["CSS", "响应式设计"],
  },
  {
    id: "5",
    title: "PostgreSQL 查询优化深度指南：从 EXPLAIN 到索引策略",
    excerpt:
      "数据库性能问题往往不是 SQL 写得不好，而是索引策略不对。系统分析 EXPLAIN 输出、理解执行计划成本模型，以及 B-tree、GIN、BRIN 索引的选择时机。",
    author: { name: "周子墨", avatarColor: "bg-cyan-500" },
    createdAt: "2024-01-05",
    readTime: 18,
    tags: ["PostgreSQL", "性能优化"],
  },
  {
    id: "6",
    title: "Zustand vs Jotai：轻量级状态管理的两种哲学",
    excerpt:
      "两者都很轻，但设计理念截然不同。Zustand 是中心化的 store，Jotai 是原子化的 primitive。对比它们在复杂应用中的心智模型和实际表现。",
    author: { name: "吴晓涵", avatarColor: "bg-pink-500" },
    createdAt: "2024-01-03",
    readTime: 7,
    tags: ["状态管理", "React"],
  },
];

function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg hover:border-primary/40 transition-[shadow,border-color,transform] duration-300 cursor-pointer">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧：视觉标记 */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
            <div
              className={`size-14 rounded-full ${article.author.avatarColor} flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white/20`}
            >
              {article.author.name.charAt(0)}
            </div>
            <Badge variant="default" className="bg-primary/90">
              精选
            </Badge>
          </div>

          {/* 右侧：内容 */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* 作者和日期 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {article.author.name}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-muted-foreground">{article.createdAt}</span>
            </div>

            {/* 标题 */}
            <h2 className="font-bold text-xl lg:text-2xl leading-tight group-hover:text-primary transition-colors text-wrap: balance">
              {article.title}
            </h2>

            {/* 摘要 */}
            <p className="text-muted-foreground leading-relaxed line-clamp-3 lg:line-clamp-2">
              {article.excerpt}
            </p>

            {/* 底部：阅读时间 + 标签 + 阅读指示 */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  <span>{article.readTime} 分钟</span>
                </div>
                <div className="flex gap-1.5">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[color,transform] duration-200" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Card className="hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 transition-[shadow,border-color,transform] duration-200 cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          {/* 左侧：作者头像 */}
          <div className="shrink-0">
            <div
              className={`size-10 rounded-full ${article.author.avatarColor} flex items-center justify-center text-white font-medium text-sm`}
            >
              {article.author.name.charAt(0)}
            </div>
          </div>

          {/* 右侧：内容 */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* 作者和日期 */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">
                {article.author.name}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>{article.createdAt}</span>
            </div>

            {/* 标题 */}
            <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2 text-wrap: balance">
              {article.title}
            </h2>

            {/* 摘要 */}
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {article.excerpt}
            </p>

            {/* 底部：阅读时间 + 标签 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{article.readTime} 分钟</span>
              </div>
              <div className="flex gap-1">
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
  );
}

export function ArticlesPage() {
  const featuredArticles = articles.filter((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="文章" description="探索技术、架构与工程实践" />

        {/* Featured Section */}
        {featuredArticles.length > 0 && (
          <section className="mb-8 lg:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                精选推荐
              </h2>
            </div>
            <div className="space-y-4">
              {featuredArticles.map((article) => (
                <FeaturedArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Articles */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-muted-foreground/30 rounded-full" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              最新发布
            </h2>
            <span className="text-xs text-muted-foreground/60 ml-auto tabular-nums">
              {regularArticles.length} 篇
            </span>
          </div>
          <div className="space-y-3">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
    </PageContainer>
  );
}
