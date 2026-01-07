import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center pl-8 pr-8 mx-auto max-w-7xl">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">NemoRDP</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
                        <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
                        <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">Docs</Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                    </div>
                    <nav className="flex items-center space-x-2">
                        <Link href="/auth/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Get Started</Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
