import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/25">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">AvaWatcher</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="text-sm font-medium text-white/90 hover:text-orange-300 transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#documentation"
            className="text-sm font-medium text-white/90 hover:text-orange-300 transition-colors duration-300"
          >
            Documentation
          </a>
          <a
            href="#support"
            className="text-sm font-medium text-white/90 hover:text-orange-300 transition-colors duration-300"
          >
            Support
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex text-white/90 hover:text-orange-300 hover:bg-orange-500/10 transition-all duration-300"

          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105"
            // go to dashboard page
            onClick={() => window.location.href = '/dashboard'}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
