import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
                <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                    Instant RDP Access. <br className="hidden sm:inline" />
                    <span className="text-primary">Zero Management.</span>
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Provision high-performance Windows and Linux remote desktops in seconds.
                    Pay with Crypto or Card. No long-term contracts.
                </p>
                <div className="space-x-4">
                    <Link href="/auth/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        Get Started
                    </Link>
                    <Link href="#pricing" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        View Pricing
                    </Link>
                </div>
            </div>
        </section>
    )
}
