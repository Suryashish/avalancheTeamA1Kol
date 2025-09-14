import { Card, CardContent } from "@/components/ui/card"

const stats = [
  { label: "Networks Monitored", value: "500+", description: "Avalanche subnets and L1s" },
  { label: "Data Points/Second", value: "10M+", description: "Real-time metrics collected" },
  { label: "Uptime Guarantee", value: "99.9%", description: "Service level agreement" },
  { label: "Alert Response Time", value: "<30s", description: "Average notification delivery" },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-border bg-card">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm font-medium text-foreground">{stat.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
