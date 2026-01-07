'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'

interface RDPInstance {
    id: number
    provider_id: string
    ip_address: string | null
    username: string | null
    os_type: string
    plan: string
    status: string
    created_at: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [instances, setInstances] = useState<RDPInstance[]>([])
    const [provisioning, setProvisioning] = useState(false)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        const fetchInstances = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const response = await fetch(`${apiUrl}/instances/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setInstances(data)
                } else if (response.status === 401) {
                    router.push('/auth/login')
                }
            } catch (error) {
                console.error("Failed to fetch instances", error)
            } finally {
                setLoading(false)
            }
        }

        fetchInstances()

        const interval = setInterval(() => {
            fetchInstances()
        }, 5000)

        return () => clearInterval(interval)

    }, [router])

    const handleDeploy = async () => {
        setProvisioning(true)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            const response = await fetch(`${apiUrl}/billing/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan: 'basic_windows',
                    payment_method: 'paystack'
                })
            })

            if (response.ok) {
                alert("Provisioning Started! Check your email or refresh in a few minutes.")
            } else {
                alert("Failed to initiate provisioning")
            }

        } catch (error) {
            console.error("Provisioning error", error)
        } finally {
            setProvisioning(false)
        }
    }

    const handleAction = async (instanceId: number, action: 'reboot' | 'terminate') => {
        if (!confirm(`Are you sure you want to ${action} this server?`)) return

        setActionLoading(instanceId)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

            let response
            if (action === 'reboot') {
                response = await fetch(`${apiUrl}/instances/${instanceId}/reboot`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            } else {
                response = await fetch(`${apiUrl}/instances/${instanceId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            }

            if (response.ok) {
                alert(`Instance ${action} initiated successfully`)
            } else {
                alert(`Failed to ${action} instance`)
            }
        } catch (error) {
            console.error("Action error", error)
        } finally {
            setActionLoading(null)
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
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <Button onClick={handleDeploy} disabled={provisioning}>
                        {provisioning ? 'Starting...' : 'Deploy New Instance'}
                    </Button>
                </div>

                <div className="grid gap-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">My Instances</h3>

                        {instances.length === 0 ? (
                            <p className="text-muted-foreground">You have no active RDP instances.</p>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">OS</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Creds</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {instances.map((instance) => (
                                            <tr key={instance.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{instance.id}</td>
                                                <td className="p-4 align-middle font-medium">{instance.os_type}</td>
                                                <td className="p-4 align-middle">{instance.ip_address || 'Pending'}</td>
                                                <td className="p-4 align-middle capitalize">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${instance.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            instance.status === 'provisioning' ? 'bg-yellow-100 text-yellow-800' :
                                                                instance.status === 'terminated' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {instance.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {instance.status === 'active' ? (
                                                        <div className="flex flex-col text-xs">
                                                            <span>User: {instance.username}</span>
                                                            <span className="blur-sm hover:blur-none cursor-pointer">Pw: {JSON.stringify(instance).includes('password') ? '******' : '******'}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={instance.status !== 'active' || actionLoading === instance.id}
                                                            onClick={() => handleAction(instance.id, 'reboot')}
                                                        >
                                                            Reboot
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={instance.status === 'terminated' || actionLoading === instance.id}
                                                            onClick={() => handleAction(instance.id, 'terminate')}
                                                        >
                                                            Terminate
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-2">Billing</h3>
                        <p className="text-muted-foreground">Current Balance: $0.00</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
