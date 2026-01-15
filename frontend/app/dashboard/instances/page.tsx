'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

// Types (should ideally be shared)
interface RDPInstance {
    id: number
    provider_id: string
    ip_address: string | null
    username: string | null
    os_type: string
    plan: string
    status: string
    created_at: string
    expires_at: string | null
}

export default function InstancesPage() {
    const router = useRouter()
    const [instances, setInstances] = useState<RDPInstance[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

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
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (response.ok) {
                    const data = await response.json()
                    setInstances(data)
                }
            } catch (error) {
                console.error("Failed to fetch instances", error)
            } finally {
                setLoading(false)
            }
        }

        fetchInstances()
    }, [router])

    const filteredInstances = instances.filter(instance =>
        instance.id.toString().includes(searchTerm) ||
        instance.ip_address?.includes(searchTerm) ||
        instance.os_type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div>Loading instances...</div>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Instances</h1>
                    <p className="text-muted-foreground">Manage and monitor your RDP servers.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/deploy')}>
                    Deploy New Server
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="search"
                        placeholder="Search by ID, IP, or OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background pl-8 border rounded-md h-9 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {filteredInstances.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {searchTerm ? 'No matching instances found.' : 'You have no instances yet.'}
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">OS</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plan</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {filteredInstances.map((instance) => (
                                        <tr key={instance.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle">{instance.id}</td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {new Date(instance.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 align-middle font-medium">{instance.os_type}</td>
                                            <td className="p-4 align-middle font-mono text-xs">{instance.ip_address || 'Pending'}</td>
                                            <td className="p-4 align-middle capitalize">{instance.plan}</td>
                                            <td className="p-4 align-middle capitalize">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${instance.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        instance.status === 'provisioning' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {instance.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                                                    Manage
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
