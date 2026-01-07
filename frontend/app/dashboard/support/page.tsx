'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'

interface Ticket {
    id: number
    subject: str
    message: str
    status: str
    created_at: str
}

export default function SupportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [showNewTicket, setShowNewTicket] = useState(false)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/support/tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            } else if (response.status === 401) {
                router.push('/auth/login')
            }
        } catch (error) {
            console.error("Failed to fetch tickets", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }
        fetchTickets()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/support/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message })
            })

            if (response.ok) {
                alert("Ticket Created!")
                setShowNewTicket(false)
                setSubject('')
                setMessage('')
                fetchTickets() // Refresh list
            } else {
                alert("Failed to create ticket")
            }
        } catch (error) {
            console.error("Ticket error", error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Support Center</h1>
                    <Button onClick={() => setShowNewTicket(!showNewTicket)}>
                        {showNewTicket ? 'Cancel' : 'Open New Ticket'}
                    </Button>
                </div>

                {showNewTicket && (
                    <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4">New Support Ticket</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Briefly describe the issue..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full p-2 rounded-md border bg-background"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Provide details about your problem..."
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {tickets.length === 0 && !showNewTicket ? (
                        <p className="text-muted-foreground text-center py-10">You have no support tickets.</p>
                    ) : (
                        tickets.map((ticket) => (
                            <div key={ticket.id} className="p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-lg">{ticket.subject}</h4>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.message}</p>
                                        <div className="text-xs text-muted-foreground mt-2">
                                            Created: {new Date(ticket.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                                ticket.status === 'answered' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </main>
            <Footer />
        </div>
    )
}
