import { createFileRoute, Link } from "@tanstack/react-router"
import {
  PenTool,
  Cloud,
  Shield,
  Code2,
  ArrowRight,
  Github,
  Twitter,
  Mail,
} from "lucide-react"
import { StarfieldBackground } from "#/components/ui/starfield"
import { Avatar, AvatarFallback } from "#/components/ui/avatar"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})

// 功能数据
const features = [
  {
    icon: PenTool,
    title: "极简编辑体验",
    description: "无干扰的写作环境，专注于内容本身，让思想自由流淌",
  },
  {
    icon: Cloud,
    title: "实时自动保存",
    description: "每一次编辑都被安全保存，无需担心内容丢失",
  },
  {
    icon: Shield,
    title: "数据安全可靠",
    description: "可靠的存储方案，你的内容永远属于你",
  },
  {
    icon: Code2,
    title: "开源透明",
    description: "代码开源，社区驱动，共同进步",
  },
]

// 技术栈数据
const techStack = {
  frontend: [
    { name: "React", color: "bg-blue-500/20" },
    { name: "TanStack Router", color: "bg-amber-500/20" },
    { name: "TanStack Query", color: "bg-amber-500/20" },
    { name: "Tailwind CSS", color: "bg-cyan-500/20" },
    { name: "Shadcn/ui", color: "bg-purple-500/20" },
  ],
  backend: [
    { name: "Hono", color: "bg-pink-500/20" },
    { name: "Prisma", color: "bg-indigo-500/20" },
    { name: "PostgreSQL", color: "bg-blue-500/20" },
  ],
}

// 作者数据
const author = {
  name: "Rinco",
  role: "全栈开发者 · 开源爱好者",
  bio: "热爱构建简洁而强大的工具，致力于让创作变得更简单",
  social: {
    github: "https://github.com/rinisnotarobot",
    twitter: "https://twitter.com/rinisnotarobot",
    email: "mailto:hello@aedium.dev",
  },
}

function AboutPage() {
  return (
    <StarfieldBackground className="min-h-screen">
      <div className="relative z-10 min-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="container mx-auto px-6 py-16 lg:py-24 max-w-6xl">
          {/* Hero Section */}
          <section className="text-center mb-20 lg:mb-32">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                backdrop-blur-xl bg-white/5 border border-white/10
                shadow-[0_0_20px_rgba(100,150,255,0.2)]"
            >
              <span className="text-sm text-white/80">创作者的首选平台</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-white">关于 </span>
              <span className="text-blue-300 drop-shadow-[0_0_30px_rgba(100,150,255,0.5)]">
                Aedium
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 mb-6">
              为思想而生，让创作自由
            </p>

            {/* Description */}
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Aedium 是一个极简主义的写作平台，专为创作者打造。
              无干扰的编辑体验，实时保存，让你的思想自由流淌。
              我们相信，好的工具应该让创作变得简单，而不是复杂。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/write"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg
                  backdrop-blur-xl bg-blue-500/20 border border-blue-400/30
                  shadow-[0_0_30px_rgba(100,150,255,0.2)]
                  hover:shadow-[0_0_40px_rgba(100,150,255,0.3)]
                  hover:bg-blue-500/30 hover:border-blue-400/40
                  transition-all duration-300"
              >
                <span className="text-white font-medium">开始写作</span>
                <ArrowRight
                  className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                  backdrop-blur-xl bg-white/5 border border-white/10
                  shadow-[0_0_30px_rgba(100,150,255,0.15)]
                  hover:shadow-[0_0_40px_rgba(100,150,255,0.25)]
                  hover:bg-white/10 hover:border-white/20
                  transition-all duration-300"
              >
                <span className="text-white/80 font-medium">阅览文章</span>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-20 lg:mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                核心功能
              </h2>
              <p className="text-white/50">为创作者精心打造的功能体验</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl text-center
                    backdrop-blur-xl bg-white/5 border border-white/10
                    shadow-[0_0_30px_rgba(100,150,255,0.15)]
                    hover:shadow-[0_0_50px_rgba(100,150,255,0.25)]
                    hover:border-white/20 hover:bg-white/10
                    transition-all duration-300 group"
                >
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4
                      bg-blue-500/10 border border-blue-400/20
                      group-hover:bg-blue-500/20 group-hover:border-blue-400/30
                      transition-all duration-300"
                  >
                    <feature.icon
                      className="w-6 h-6 text-blue-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="mb-20 lg:mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                技术栈
              </h2>
              <p className="text-white/50">构建 Aedium 的现代技术</p>
            </div>

            <div className="space-y-8">
              {/* Frontend */}
              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">
                  前端框架
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {techStack.frontend.map((tech) => (
                    <span
                      key={tech.name}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                        backdrop-blur-xl ${tech.color} border border-white/10
                        text-white/80 hover:bg-white/15 transition-all duration-300`}
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Backend */}
              <div className="text-center">
                <h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">
                  后端技术
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {techStack.backend.map((tech) => (
                    <span
                      key={tech.name}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                        backdrop-blur-xl ${tech.color} border border-white/10
                        text-white/80 hover:bg-white/15 transition-all duration-300`}
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Author Section */}
          <section className="mb-20 lg:mb-32">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                关于作者
              </h2>
              <p className="text-white/50">创造 Aedium 的人</p>
            </div>

            <div
              className="max-w-xl mx-auto p-6 rounded-xl
                backdrop-blur-xl bg-white/5 border border-white/10
                shadow-[0_0_30px_rgba(100,150,255,0.15)]
                hover:shadow-[0_0_50px_rgba(100,150,255,0.25)]
                hover:border-white/20
                transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <Avatar className="w-20 h-20 ring-2 ring-blue-400/30 ring-offset-2 ring-offset-[#0a0a0f]">
                  <AvatarFallback
                    className="bg-blue-500/20 text-blue-300 text-2xl font-bold"
                  >
                    R
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {author.name}
                  </h3>
                  <p className="text-sm text-white/50 mb-2">{author.role}</p>
                  <p className="text-sm text-white/40 mb-4">{author.bio}</p>

                  {/* Social Links */}
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <a
                      href={author.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                        backdrop-blur-xl bg-white/5 border border-white/10
                        hover:bg-white/10 hover:border-white/20 hover:text-blue-300
                        text-white/60 transition-all duration-300"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                        backdrop-blur-xl bg-white/5 border border-white/10
                        hover:bg-white/10 hover:border-white/20 hover:text-blue-300
                        text-white/60 transition-all duration-300"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={author.social.email}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                        backdrop-blur-xl bg-white/5 border border-white/10
                        hover:bg-white/10 hover:border-white/20 hover:text-blue-300
                        text-white/60 transition-all duration-300"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="text-center pb-12">
            <div
              className="inline-block p-8 rounded-xl
                backdrop-blur-xl bg-white/5 border border-white/10
                shadow-[0_0_30px_rgba(100,150,255,0.15)]"
            >
              <p className="text-xl text-white mb-6">
                准备好开始你的创作之旅了吗？
              </p>
              <Link
                to="/write"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg
                  backdrop-blur-xl bg-blue-500/20 border border-blue-400/30
                  shadow-[0_0_40px_rgba(100,150,255,0.25)]
                  hover:shadow-[0_0_60px_rgba(100,150,255,0.35)]
                  hover:bg-blue-500/30 hover:border-blue-400/40
                  transition-all duration-300"
              >
                <span className="text-white font-semibold">立即开始写作</span>
                <ArrowRight
                  className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </StarfieldBackground>
  )
}