import { Link } from "@tanstack/react-router"
import { Sparkles, ArrowRight } from "lucide-react"
import { StarfieldBackground } from "#/components/ui/starfield"

export function StarfieldHero() {
  return (
    <StarfieldBackground count={500} speed={0.3} starColor="#ffffff" twinkle>
      {/* Minimal top-right login entry — keeps the immersive feel */}
      <div className="absolute top-0 right-0 z-20 p-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                     backdrop-blur-xl bg-white/5 border border-white/10
                     text-sm font-medium text-white/80
                     hover:bg-white/10 hover:border-white/20 hover:text-white
                     transition-all duration-300"
        >
          登录
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                     backdrop-blur-xl bg-white/5 border border-white/10
                     shadow-[0_0_20px_rgba(220,120,60,0.2)]"
        >
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-white/80">新一代写作平台</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center text-white mb-6">
          让思想
          <span className="text-primary drop-shadow-[0_0_30px_rgba(220,120,60,0.5)]">
            自由流淌
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/70 text-center max-w-2xl mb-12 leading-relaxed">
          Cedium 为创作者打造。极简编辑器，实时保存，专注写作本身。
          <br />
          无干扰，无杂念，只有你和文字。
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/articles"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       backdrop-blur-xl bg-white/5 border border-white/10
                       shadow-[0_0_30px_rgba(0,0,0,0.15)]
                       hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]
                       hover:border-white/20 hover:bg-white/10
                       transition-all duration-300"
          >
            <span className="text-white font-medium">阅览文章</span>
            <ArrowRight className="size-4 text-white/70 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/write"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       backdrop-blur-xl bg-primary/20 border border-primary/30
                       shadow-[0_0_30px_rgba(220,120,60,0.2)]
                       hover:shadow-[0_0_50px_rgba(220,120,60,0.4)]
                       hover:border-primary/50 hover:bg-primary/30
                       transition-all duration-300"
          >
            <span className="text-white font-medium">开始写作</span>
            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </StarfieldBackground>
  )
}
