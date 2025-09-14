import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-10 sm:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Animated particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-60 animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-orange-300 rounded-full opacity-40 animate-[float_4s_ease-in-out_infinite_1s]" />
        <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-orange-500 rounded-full opacity-50 animate-[float_5s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-orange-400 rounded-full opacity-30 animate-[float_7s_ease-in-out_infinite_1.5s]" />
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-orange-300 rounded-full opacity-40 animate-[float_4.5s_ease-in-out_infinite_0.5s]" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-orange-500 rounded-full opacity-35 animate-[float_6.5s_ease-in-out_infinite_2.5s]" />
        
        {/* Sparkle effects */}
        <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-white rounded-full opacity-80 animate-[sparkle_3s_ease-in-out_infinite]" />
        <div className="absolute top-3/5 right-1/5 w-0.5 h-0.5 bg-white rounded-full opacity-60 animate-[sparkle_2.5s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/5 left-3/5 w-1 h-1 bg-white rounded-full opacity-70 animate-[sparkle_3.5s_ease-in-out_infinite_1.5s]" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Additional glow layers */}
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-600/2 rounded-full blur-2xl animate-pulse delay-500" />
      <div className="absolute bottom-1/3 left-1/5 w-72 h-72 bg-orange-300/3 rounded-full blur-3xl animate-pulse delay-1500" />

      <div className="container mx-auto px-4 relative">
        <div className="mx-auto max-w-4xl text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-orange-500/10 text-orange-200 border border-orange-500/20 shadow-lg shadow-orange-500/10 animate-fade-in"
          >
            🚀 Now monitor your Avalanche subnets with a click
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl text-balance animate-fade-in-up">
            Avalanche L1/
            <span className="relative text-white">
              {/* <span className="absolute inset-0 text-white blur-xl drop-shadow-[0_0_30px_rgba(251,146,60,0.3)] animate-pulse">Subnet Watcher</span> */}
              <span className="absolute inset-0 text-white blur-lg drop-shadow-[0_0_20px_rgba(251,146,60,0.1)]">Subnet Watcher</span>
              <span className="relative text-white drop-shadow-[0_0_20px_rgba(251,146,60,0.2)] [text-shadow:0_0_40px_rgba(251,146,60,0.2),0_0_60px_rgba(251,146,60,0.2),0_0_80px_rgba(251,146,60,0.2)]">Subnet Watcher</span>
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/90 sm:text-xl text-pretty max-w-2xl mx-auto animate-fade-in-up delay-200">
            Monitor the data availability across your avalanche network with unmatched precision. Real-time insights,
            comprehensive analytics, and reliable alerting for your blockchain infrastructure.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = '/dashboard'}
            >
              Start Monitoring
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 bg-transparent border-orange-400/40 text-white hover:bg-orange-500/10 hover:border-orange-400/60 transition-all duration-300"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 flow-root animate-fade-in-up delay-500">
            <div className="relative rounded-xl bg-card/50 border border-orange-500/20 p-2 shadow-2xl shadow-orange-500/10 backdrop-blur-sm">
              <div className="rounded-lg bg-background/30 p-8 border border-orange-500/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="relative text-3xl font-bold">
                      <span className="absolute inset-0 text-white blur-lg drop-shadow-[0_0_25px_rgba(251,146,60,0.1)] animate-pulse">99.9%</span>
                      <span className="relative text-white [text-shadow:0_0_30px_rgba(251,146,60,0.2),0_0_40px_rgba(251,146,60,0.2)]">99.9%</span>
                    </div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="relative text-3xl font-bold">
                      <span className="absolute inset-0 text-white blur-lg drop-shadow-[0_0_25px_rgba(251,146,60,0.1)] animate-pulse">500+</span>
                      <span className="relative text-white [text-shadow:0_0_30px_rgba(251,146,60,0.2),0_0_40px_rgba(251,146,60,0.2)]">500+</span>
                    </div>
                    <div className="text-sm text-gray-400">Subnets Monitored</div>
                  </div>
                  <div className="group hover:scale-105 transition-transform duration-300">
                    <div className="relative text-3xl font-bold">
                      <span className="absolute inset-0 text-white blur-lg drop-shadow-[0_0_25px_rgba(251,146,60,0.1)] animate-pulse">24/7</span>
                      <span className="relative text-white [text-shadow:0_0_30px_rgba(251,146,60,0.2),0_0_40px_rgba(251,146,60,0.2)]">24/7</span>
                    </div>
                    <div className="text-sm text-gray-400">Real-time Alerts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
