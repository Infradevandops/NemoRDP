'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { toast } from 'sonner'

const faqs = [
    {
        question: "How long does it take to provision an RDP?",
        answer: "Most RDP instances are ready within 2-3 minutes. Windows servers may take slightly longer than Linux instances."
    },
    {
        question: "Can I install my own software?",
        answer: "Yes! You have full administrator/root access to install any software you need."
    },
    {
        question: "What happens if I exceed my bandwidth limit?",
        answer: "We'll notify you when you reach 80% of your limit. You can upgrade your plan or purchase additional bandwidth."
    },
    {
        question: "How do I connect to my RDP?",
        answer: "Use the built-in Remote Desktop Connection on Windows, Microsoft Remote Desktop on Mac, or Remmina on Linux."
    },
    {
        question: "Can I get a refund?",
        answer: "We offer a 7-day money-back guarantee for new customers. Contact support for refund requests."
    }
]

export default function SupportPage() {
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        priority: 'medium',
        message: ''
    })
    const [loading, setLoading] = useState(false)

    const submitTicket = async () => {
        if (!ticketForm.subject || !ticketForm.message) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(ticketForm)
            })

            if (response.ok) {
                setTicketForm({ subject: '', priority: 'medium', message: '' })
                toast.success('Support ticket created successfully!')
            } else {
                toast.error('Failed to create ticket')
            }
        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Support Center</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Frequently Asked Questions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                                        <AccordionContent>{faq.answer}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start h-auto py-3">
                                <span className="mr-2">📖</span> Getting Started Guide
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-auto py-3">
                                <span className="mr-2">🔧</span> Troubleshooting
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-auto py-3">
                                <span className="mr-2">💰</span> Billing Help
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Support Ticket Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Support Ticket</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <Input
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Priority</label>
                                <select
                                    className="w-full p-2 border rounded-md bg-background"
                                    value={ticketForm.priority}
                                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                >
                                    <option value="low">Low - General question</option>
                                    <option value="medium">Medium - Issue affecting usage</option>
                                    <option value="high">High - Service disruption</option>
                                    <option value="urgent">Urgent - Complete service failure</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <Textarea
                                    value={ticketForm.message}
                                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                                    placeholder="Please describe your issue in detail..."
                                    rows={6}
                                />
                            </div>

                            <Button onClick={submitTicket} className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
