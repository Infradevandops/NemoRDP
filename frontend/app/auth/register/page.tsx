import { AuthForm } from '@/components/AuthForm'
import Link from 'next/link'

export default function RegisterPage() {
    return (
        <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Link href="/">NemoRDP</Link>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;I was able to spin up a high-performance Windows VM in minutes. The 24/7 support is a lifesaver.&rdquo;
                        </p>
                        <footer className="text-sm">Alex Chen</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <AuthForm type="register" />
                </div>
            </div>
        </div>
    )
}
