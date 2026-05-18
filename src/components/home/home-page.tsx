import { Link } from "@tanstack/react-router"
import { ArrowRight, Feather, Sparkles, Users, BookOpen } from "lucide-react"
import { Button } from "#/components/ui/button"

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orb */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium text-primary">新一代写作平台</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="text-foreground">让思想</span>
                <br />
                <span className="text-primary">自由流淌</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Cedium 为创作者打造。极简编辑器，实时保存，专注写作本身。
                无干扰，无杂念，只有你和文字。
              </p>

              <div className="flex items-center gap-4">
                <Button size="lg" asChild className="gap-2 group">
                  <Link to="/write">
                    开始写作
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Feather className="size-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">专注写作</h3>
                    <p className="text-muted-foreground mt-1">清爽界面，无干扰模式，沉浸式创作体验</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">实时保存</h3>
                    <p className="text-sm text-muted-foreground mt-1">草稿自动保存，断网也不丢失</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Users className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">社区互动</h3>
                    <p className="text-sm text-muted-foreground mt-1">发现好文章，连接创作者</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">为什么选择 Cedium</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              我们相信写作应该是一件简单而愉悦的事
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "零配置开始",
                desc: "打开页面就能写，无需繁琐设置。你的注意力只属于创作。",
                icon: Sparkles,
              },
              {
                title: "富文本编辑",
                desc: "标题、列表、引用、代码块，一切格式触手可及。",
                icon: BookOpen,
              },
              {
                title: "响应式设计",
                desc: "手机、平板、桌面，随时随地记录灵感。",
                icon: Feather,
              },
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all group">
                <div className="p-3 rounded-xl bg-primary/10 inline-block mb-4">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="relative rounded-3xl bg-primary/5 border border-primary/20 p-12 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative text-center">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
                准备好开始了吗？
              </h2>
              <p className="text-xl text-muted-foreground mt-4 max-w-lg mx-auto">
                创造属于你的文字世界，现在就行动
              </p>
              <Button size="lg" asChild className="mt-8 gap-2 group">
                <Link to="/write">
                  立即开始
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}