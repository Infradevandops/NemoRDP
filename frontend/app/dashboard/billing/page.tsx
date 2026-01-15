'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Payment {
    id: number
    amount: number
    currency: string
    status: string
    provider: string
    reference: string
    description: string
    created_at: string
}

export default function BillingPage() {
    const router = useRouter()
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        const fetchPayments = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(`${apiUrl}/billing/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setPayments(data)
                } else if (response.status === 401) {
                    router.push('/auth/login')
                }
            } catch (error) {
                console.error("Failed to fetch payments", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPayments()
    }, [router])

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading billing history...</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Billing & Invoices</h1>
                    <p className="text-muted-foreground">View your payment history and manage invoices.</p>
                </div>
                {/* Actions like Add Payment Method could go here */}
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 table-container">
                <h2 className="text-xl font-semibold mb-4">Payment History</h2>

                {payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No payment history found.
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            {new Date(payment.created_at).toLocaleDateString()} {new Date(payment.created_at).toLocaleTimeString()}
                                        </td>
                                        <td className="p-4 align-middle">{payment.description || 'N/A'}</td>
                                        <td className="p-4 align-middle font-medium">
                                            {payment.currency === 'USD' ? '$' : '₦'}{payment.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 align-middle capitalize">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle font-mono text-xs text-muted-foreground">
                                            {payment.reference.substring(0, 8)}...
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
