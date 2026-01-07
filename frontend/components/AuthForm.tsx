'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
    type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register'
            // Note: In a real app we would use an environment variable for the API URL
            // For now we assume proxy or direct localhost
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const formData = new URLSearchParams()
            formData.append('username', email) // OAuth2PasswordRequestForm expects username
            formData.append('password', password)

            // Register endpoint expects JSON, Login expects Form Data (OAuth2 standard)
            let response
            if (type === 'login') {
                response = await fetch(`${apiUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData,
                })
            } else {
                response = await fetch(`${apiUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                })
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Authentication failed')
            }

            // Store token
            localStorage.setItem('token', data.access_token)

            // Redirect
            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {type === 'login' ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {type === 'login'
                        ? 'Enter your email to sign in to your account'
                        : 'Enter your email below to create your account'}
                </p>
            </div>

            <div className="grid gap-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <div className="grid gap-1">
                            <label className="sr-only" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={loading}
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label className="sr-only" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                placeholder="Password"
                                type="password"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={loading}
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 font-medium">
                                {error}
                            </div>
                        )}
                        <button
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            disabled={loading}
                        >
                            {loading && (
                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            )}
                            {type === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </form>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                <Link
                    href={type === 'login' ? '/auth/register' : '/auth/login'}
                    className="hover:text-brand underline underline-offset-4"
                >
                    {type === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Link>
            </p>
        </div>
    )
}
