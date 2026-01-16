'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Server, Ticket, DollarSign } from 'lucide-react'

// Define fetcher
const fetcher = async (url: string) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('No token')

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
            throw new Error('Unauthorized')
        }
        throw new Error('Failed to fetch data')
    }
    return res.json()
}

export default function AdminDashboard() {
    const router = useRouter()

    const { data: stats, error, isLoading } = useSWR('/admin/stats', fetcher, {
        onError: (err) => {
            if (err.message === 'Unauthorized') {
                router.push('/dashboard') // Redirect non-admins back to dashboard
            }
        }
    })

    if (isLoading) return <div className="p-8">Loading stats...</div>
    if (error) return <div className="p-8 text-red-500">Error loading admin stats. Access Denied?</div>

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Admin Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Servers</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.active_instances || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            of {stats?.total_instances || 0} total created
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.open_tickets || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.revenue || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on active instances
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
