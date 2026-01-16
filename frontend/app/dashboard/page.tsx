'use client'

import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, CreditCard, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button' // Assumed path, will verify with list_dir
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectModal } from '@/components/ConnectModal'
import { WelcomeTooltip } from '@/components/WelcomeTooltip'

interface RDPInstance {
    id: number
    provider_id: string
    ip_address: string | null
    username: string | null
    password?: string
    os_type: string
    plan: string
    status: string
    created_at: string
    expires_at: string | null
}

const fetcher = async (url: string) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Unauthorized')
        }
        throw new Error('An error occurred while fetching the data.')
    }
    return res.json()
}

const getTimeRemaining = (expiresAt: string | null): { text: string; urgent: boolean } => {
    if (!expiresAt) return { text: 'Never', urgent: false }

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff < 0) return { text: 'Expired', urgent: true }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 24) {
        return { text: `${hours}h`, urgent: true }
    } else if (days < 7) {
        return { text: `${days}d`, urgent: days < 2 }
    } else {
        return { text: `${Math.floor(days / 7)}w`, urgent: false }
    }
}


export default function DashboardPage() {
    const router = useRouter()
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [connectingInstance, setConnectingInstance] = useState<RDPInstance | null>(null)
    const [showWelcome, setShowWelcome] = useState(false)

    // SWR Hook for polling
    const { data: instances = [], error, isLoading, mutate } = useSWR<RDPInstance[]>(
        '/instances/',
        fetcher,
        {
            refreshInterval: 5000,
            onError: (err) => {
                if (err.message === 'Unauthorized') {
                    router.push('/auth/login')
                }
            }
        }
    )

    useEffect(() => {
        // Check if user has seen welcome
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
        if (!hasSeenWelcome) {
            setTimeout(() => setShowWelcome(true), 500)
        }
    }, [])

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
                toast.success(`Instance ${action} initiated successfully`)
            } else {
                toast.error(`Failed to ${action} instance`)
            }
        } catch (error) {
            console.error("Action error", error)
            toast.error(`An error occurred while trying to ${action} the instance`)
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>
    }



    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Overview</h1>
                <Button onClick={() => router.push('/dashboard/deploy')}>
                    Deploy New Instance
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Instances
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{instances.filter(i => i.status === 'active').length}</div>
                        <p className="text-xs text-muted-foreground">
                            {instances.length} total servers
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Usage
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">
                            For this billing period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Spent
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime spend
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-3">
                <Card className="xl:col-span-3">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Instances</CardTitle>
                            <CardDescription>
                                Recent instances and their status.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {instances.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <p className="mb-4">You have no active RDP instances.</p>
                                <Button variant="outline" onClick={() => router.push('/dashboard/deploy')}>Deploy Server</Button>
                            </div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">OS</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Connect</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {instances.map((instance) => {
                                            const timeRemaining = getTimeRemaining(instance.expires_at)
                                            return (
                                                <tr key={instance.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle">{instance.id}</td>
                                                    <td className="p-4 align-middle font-medium">{instance.os_type}</td>
                                                    <td className="p-4 align-middle">{instance.ip_address || 'Pending'}</td>
                                                    <td className="p-4 align-middle capitalize">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${instance.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            instance.status === 'provisioning' ? 'bg-yellow-100 text-yellow-800' :
                                                                instance.status === 'terminated' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {instance.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${timeRemaining.urgent ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {timeRemaining.text}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={instance.status !== 'active'}
                                                            onClick={() => setConnectingInstance(instance)}
                                                        >
                                                            Connect
                                                        </Button>
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
                                                                variant="default"
                                                                size="sm"
                                                                disabled={instance.status === 'terminated' || actionLoading === instance.id}
                                                                onClick={async () => {
                                                                    if (!confirm('Extend for 7 days ($8)?')) return
                                                                    setActionLoading(instance.id)
                                                                    try {
                                                                        const token = localStorage.getItem('token')
                                                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                                                                        const response = await fetch(`${apiUrl}/instances/${instance.id}/extend`, {
                                                                            method: 'POST',
                                                                            headers: {
                                                                                'Content-Type': 'application/json',
                                                                                'Authorization': `Bearer ${token}`
                                                                            },
                                                                            body: JSON.stringify({ days: 7 })
                                                                        })
                                                                        if (response.ok) {
                                                                            toast.success('Instance extended by 7 days!')
                                                                            mutate() // Revalidate data immediately
                                                                        } else {
                                                                            toast.error('Failed to extend instance')
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Extend error:', error)
                                                                        toast.error('Failed to extend instance')
                                                                    } finally {
                                                                        setActionLoading(null)
                                                                    }
                                                                }}
                                                            >
                                                                {actionLoading === instance.id ? 'Processing...' : 'Extend'}
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
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>


            {
                connectingInstance && (
                    <ConnectModal
                        instance={connectingInstance}
                        onClose={() => setConnectingInstance(null)}
                    />
                )
            }
            {
                showWelcome && (
                    <WelcomeTooltip
                        onClose={() => {
                            localStorage.setItem('hasSeenWelcome', 'true')
                            setShowWelcome(false)
                        }}
                    />
                )
            }
        </div >
    )
}
