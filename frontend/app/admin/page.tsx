'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface AdminStats {
    total_users: number
    active_instances: number
    total_instances: number
    open_tickets: number
    revenue: number
}

interface User {
    id: number
    email: string
    is_active: boolean
    created_at: string
}

export default function AdminPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
            return
        }

        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

                // Fetch Stats
                const statsRes = await fetch(`${apiUrl}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (statsRes.ok) {
                    setStats(await statsRes.json())
                } else if (statsRes.status === 403 || statsRes.status === 401) {
                    // Not admin or not logged in
                    router.push('/dashboard')
                    return
                }

                // Fetch Users
                const usersRes = await fetch(`${apiUrl}/admin/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (usersRes.ok) {
                    setUsers(await usersRes.json())
                }

            } catch (error) {
                console.error("Failed to fetch admin data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Admin Panel...</div>
    }

    if (!stats) return <div className="p-8">Access Denied</div>

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                        <p className="text-2xl font-bold mt-2">${stats.revenue.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Active Instances</h3>
                        <p className="text-2xl font-bold mt-2">{stats.active_instances}</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                        <p className="text-2xl font-bold mt-2">{stats.total_users}</p>
                    </div>
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground">Open Tickets</h3>
                        <p className="text-2xl font-bold mt-2">{stats.open_tickets}</p>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{user.id}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    )
}
