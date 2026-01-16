'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BadgeCheck, XCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Missing verification token.')
            return
        }

        const verify = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/auth/verify-email?token=${token}`, {
                    method: 'POST'
                })

                const data = await res.json()

                if (res.ok) {
                    setStatus('success')
                    setMessage(data.message || 'Email verified successfully.')
                } else {
                    setStatus('error')
                    setMessage(data.detail || 'Verification failed.')
                }
            } catch (err) {
                setStatus('error')
                setMessage('An error occurred during verification.')
            }
        }

        verify()
    }, [token])

    return (
        <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    {status === 'loading' && <div className="rounded-full bg-blue-100 p-3"><Loader2 className="h-8 w-8 text-blue-600 animate-spin" /></div>}
                    {status === 'success' && <div className="rounded-full bg-green-100 p-3"><BadgeCheck className="h-8 w-8 text-green-600" /></div>}
                    {status === 'error' && <div className="rounded-full bg-red-100 p-3"><XCircle className="h-8 w-8 text-red-600" /></div>}
                </div>
                <CardTitle className="text-2xl">
                    {status === 'loading' && 'Verifying Email...'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </CardTitle>
                <CardDescription>
                    {message}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {status !== 'loading' && (
                    <Button asChild className="w-full">
                        <Link href="/auth/login">Continue to Login</Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default function VerifyEmailPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
