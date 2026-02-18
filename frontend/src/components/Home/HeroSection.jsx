import { ShoppingCart, ChevronRight, Zap, Shield, Truck } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.15),transparent)]">

      {/* Floating orange orb – very faint depth layer */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-orange-500 opacity-[0.07] blur-[120px]" />

      {/* Subtle grid overlay for tech feel */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-400 backdrop-blur-sm">
          <Zap className="h-4 w-4" />
          <span>New Arrivals 2026</span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your One-Stop{' '}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Electronics
          </span>{' '}
          Store
        </h1>

        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
          Discover the latest gadgets, cutting-edge technology, and premium
          electronics at unbeatable prices. Trusted by thousands of tech
          enthusiasts worldwide.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Glowing Shop Now */}
          <button className="group inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0">
            <ShoppingCart className="h-5 w-5" />
            Shop Now
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Browse Categories */}
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-8 py-3.5 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-slate-400 hover:text-white hover:bg-white/5">
            Browse Categories
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500/70" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500/70" />
            <span>2-Year Warranty</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-500/70" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 to-transparent" />
    </section>
  )
}
