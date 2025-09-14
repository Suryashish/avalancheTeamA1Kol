import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, BarChart3, Bell, Shield, Zap, Globe, Database, AlertTriangle, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description:
      "Track subnet health, validator performance, and network metrics in real-time with sub-second precision.",
    badge: "Core",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Comprehensive dashboards with historical data, trend analysis, and predictive insights for your network.",
    badge: "Analytics",
  },
  {
    icon: Bell,
    title: "Smart Alerting",
    description: "Customizable alerts via email, Slack, or webhook when network anomalies or threshold breaches occur.",
    badge: "Alerts",
  },
  {
    icon: Shield,
    title: "Security Monitoring",
    description: "Monitor for potential security threats, unusual validator behavior, and network attack patterns.",
    badge: "Security",
  },
  {
    icon: Database,
    title: "Data Availability",
    description:
      "Ensure data availability across all your subnets with comprehensive availability scoring and reporting.",
    badge: "Core",
  },
  {
    icon: Globe,
    title: "Multi-Subnet Support",
    description: "Monitor multiple Avalanche subnets and L1s from a single, unified dashboard interface.",
    badge: "Scale",
  },
  {
    icon: Zap,
    title: "Performance Metrics",
    description: "Track transaction throughput, block times, gas usage, and other critical performance indicators.",
    badge: "Performance",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Identify patterns and trends in your network data to optimize performance and predict issues.",
    badge: "Analytics",
  },
  {
    icon: AlertTriangle,
    title: "Incident Management",
    description:
      "Automated incident detection and management with detailed root cause analysis and resolution tracking.",
    badge: "Management",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything you need to monitor your Avalanche network
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Comprehensive monitoring tools designed specifically for Avalanche subnets and L1 networks.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-border bg-card hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
