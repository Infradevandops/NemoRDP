'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Define fetcher (duplicated for now, could be shared util)
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

export default function AdminUsersPage() {
    const router = useRouter()

    // Fetch users securely
    const { data: users, error, isLoading, mutate } = useSWR('/admin/users', fetcher, {
        onError: (err) => {
            if (err.message === 'Unauthorized') {
                router.push('/dashboard')
            }
        }
    })

    const toggleBan = async (userId: number, currentStatus: boolean) => {
        const action = currentStatus ? 'ban' : 'unban'
        if (!confirm(`Are you sure you want to ${action} this user?`)) return

        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/admin/users/${userId}/${action}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                // Optimistic update or refetch
                mutate()
                // Show success toast (add toast import if needed, assuming simple alert for now or silent refresh)
            } else {
                alert('Failed to update user status')
            }
        } catch (e) {
            console.error(e)
            alert('Error updating user')
        }
    }

    if (isLoading) return <div className="p-8">Loading users...</div>
    if (error) return <div className="p-8 text-red-500">Error loading users. Access Denied?</div>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button variant="outline">Export CSV</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created At</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users?.map((user: any) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{user.id}</td>
                                        <td className="p-4 align-middle">{user.email}</td>
                                        <td className="p-4 align-middle">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.is_active ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Button
                                                variant={user.is_active ? "destructive" : "default"}
                                                size="sm"
                                                onClick={() => toggleBan(user.id, user.is_active)}
                                            >
                                                {user.is_active ? 'Ban User' : 'Unban User'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
