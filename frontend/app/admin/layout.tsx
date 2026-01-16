'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Server,
    Menu,
    Shield
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem('token')
        toast.success('Logged out successfully')
        router.push('/auth/login')
    }

    const NavItems = () => (
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <div className="mb-4 px-4 py-2">
                <h2 className="text-lg font-bold tracking-tight text-red-600 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    ADMIN PANEL
                </h2>
            </div>

            <Link
                href="/admin"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === '/admin' ? 'bg-muted text-primary' : 'text-muted-foreground'
                    }`}
                onClick={() => setIsMobileOpen(false)}
            >
                <LayoutDashboard className="h-4 w-4" />
                Overview
            </Link>

            <Link
                href="/admin/users"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === '/admin/users' ? 'bg-muted text-primary' : 'text-muted-foreground'
                    }`}
                onClick={() => setIsMobileOpen(false)}
            >
                <Users className="h-4 w-4" />
                Users
            </Link>

            <div className="mt-auto px-4 py-2">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        setIsMobileOpen(false)
                        router.push('/dashboard')
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Exit to User App
                </Button>
            </div>
        </nav>
    )

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Server className="h-6 w-6" />
                            <span className="">NemoRDP</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <NavItems />
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                            <NavItems />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Search or breadcrumbs could go here */}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
