import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "AvaWatcher has been instrumental in maintaining our subnet's reliability. The real-time alerts have prevented multiple potential outages.",
    author: "Sarah Chen",
    role: "Lead DevOps Engineer",
    company: "DeFi Protocol",
    initials: "SC",
  },
  {
    quote:
      "The analytics dashboard gives us insights we never had before. We can now predict and prevent issues before they impact our users.",
    author: "Marcus Rodriguez",
    role: "Blockchain Architect",
    company: "GameFi Platform",
    initials: "MR",
  },
  {
    quote:
      "Managing multiple subnets was a nightmare until we found AvaWatcher. Now everything is centralized and automated.",
    author: "Emily Watson",
    role: "Infrastructure Lead",
    company: "Enterprise Blockchain",
    initials: "EW",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by blockchain teams worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            See what developers and infrastructure teams are saying about AvaWatcher.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <blockquote className="text-sm leading-relaxed text-card-foreground">"{testimonial.quote}"</blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-foreground">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
