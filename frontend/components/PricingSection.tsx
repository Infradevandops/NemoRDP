import { Check } from "lucide-react"

export function PricingSection() {
    return (
        <section id="pricing" className="container py-8 md:py-12 lg:py-24 mx-auto max-w-7xl">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                    Simple, transparent pricing
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Choose the right plan for your needs. All plans include 24/7 support.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {/* Basic Plan */}
                <div className="flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
                    <h3 className="text-xl font-bold">Basic RDP</h3>
                    <div className="text-3xl font-bold">$15<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground">Perfect for light browsing and testing.</p>
                    <ul className="space-y-2 mt-4 flex-1">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 2 vCPU</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 4GB RAM</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 50GB NVMe SSD</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Windows Server 2022</li>
                    </ul>
                    <a href="/auth/register?plan=basic" className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Choose Basic</a>
                </div>

                {/* Performance Plan */}
                <div className="flex flex-col gap-4 rounded-xl border p-6 shadow-sm bg-accent/10 border-primary/20 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">POPULAR</div>
                    <h3 className="text-xl font-bold">Performance RDP</h3>
                    <div className="text-3xl font-bold">$30<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground">For power users and multitasking.</p>
                    <ul className="space-y-2 mt-4 flex-1">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 4 vCPU</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 8GB RAM</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 100GB NVMe SSD</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Windows / Ubuntu</li>
                    </ul>
                    <a href="/auth/register?plan=performance" className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">Choose Performance</a>
                </div>

                {/* GPU Plan */}
                <div className="flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
                    <h3 className="text-xl font-bold">GPU RDP</h3>
                    <div className="text-3xl font-bold">$80<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                    <p className="text-muted-foreground">For graphic intensive applications.</p>
                    <ul className="space-y-2 mt-4 flex-1">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 8 vCPU</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 16GB RAM</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 200GB NVMe SSD</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> NVIDIA GPU</li>
                    </ul>
                    <a href="/auth/register?plan=gpu" className="mt-8 inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">Choose GPU</a>
                </div>
            </div>
        </section>
    )
}
