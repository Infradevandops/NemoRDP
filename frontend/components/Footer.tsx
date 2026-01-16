export function Footer() {
    return (
        <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row mx-auto max-w-7xl">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; 2026 NemoRDP. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <a href="/terms" className="hover:text-foreground hover:underline">Terms of Service</a>
                    <a href="/privacy" className="hover:text-foreground hover:underline">Privacy Policy</a>
                </div>
            </div>
        </footer>
    )
}
