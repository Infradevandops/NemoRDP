'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState(true)
    const [autoShutdown, setAutoShutdown] = useState(false)

    // SSH Key State
    const [sshKeys, setSshKeys] = useState<any[]>([])
    const [showAddKey, setShowAddKey] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [newKeyContent, setNewKeyContent] = useState('')
    const [loadingKeys, setLoadingKeys] = useState(false)
    const [isAddingKey, setIsAddingKey] = useState(false)

    // Load Keys
    const fetchKeys = async () => {
        setLoadingKeys(true)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/ssh-keys/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) setSshKeys(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingKeys(false)
        }
    }


    // Initial Load
    useEffect(() => {
        fetchKeys()
    }, [])

    const handleAddKey = async () => {
        if (!newKeyName || !newKeyContent) {
            toast.error('Name and Key content are required')
            return
        }
        setIsAddingKey(true)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/ssh-keys/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newKeyName, public_key: newKeyContent })
            })

            if (res.ok) {
                toast.success('SSH Key added successfully')
                setNewKeyName('')
                setNewKeyContent('')
                setShowAddKey(false)
                fetchKeys()
            } else {
                const err = await res.json()
                toast.error(err.detail || 'Failed to add key')
            }
        } catch (e) {
            toast.error('Failed to add key')
        } finally {
            setIsAddingKey(false)
        }
    }

    const handleDeleteKey = async (id: number) => {
        if (!confirm('Are you sure you want to delete this key?')) return
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            await fetch(`${apiUrl}/ssh-keys/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            toast.success('Key deleted')
            fetchKeys()
        } catch (e) {
            toast.error('Failed to delete key')
        }
    }

    const handleSave = () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            toast.success('Settings saved successfully')
        }, 1000)
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your email and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input defaultValue="user@example.com" disabled />
                            <p className="text-xs text-muted-foreground">Email cannot be changed directly. Contact support for assistance.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>Customize your experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Email Notifications</label>
                                <p className="text-xs text-muted-foreground">Receive alerts when your instance is ready or expiring.</p>
                            </div>
                            <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Auto-shutdown</label>
                                <p className="text-xs text-muted-foreground">Automatically shutdown instances after 24h of inactivity (Experimental).</p>
                            </div>
                            <Switch checked={autoShutdown} onCheckedChange={setAutoShutdown} />
                        </div>
                    </CardContent>
                </Card>

                {/* SSH Keys Management */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>SSH Keys</CardTitle>
                            <CardDescription>Manage public keys for accessing Linux instances.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowAddKey(!showAddKey)}>
                            {showAddKey ? 'Cancel' : 'Add New Key'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Key Form */}
                        {showAddKey && (
                            <div className="rounded-lg border p-4 bg-muted/50 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Key Name</label>
                                    <Input
                                        placeholder="e.g. My MacBook Pro"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Public Key</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="ssh-rsa AAAA..."
                                        value={newKeyContent}
                                        onChange={(e) => setNewKeyContent(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAddKey} disabled={isAddingKey}>
                                    {isAddingKey ? 'Adding...' : 'Save SSH Key'}
                                </Button>
                            </div>
                        )}

                        {/* Keys List */}
                        <div className="space-y-4">
                            {loadingKeys ? (
                                <p className="text-sm text-muted-foreground">Loading keys...</p>
                            ) : sshKeys.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No SSH keys added yet.</p>
                            ) : (
                                sshKeys.map((key: any) => (
                                    <div key={key.id} className="flex items-center justify-between rounded-md border p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                                <span className="font-mono font-bold text-primary">SSH</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{key.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                                                    {key.public_key.substring(0, 30)}...
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteKey(key.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="text-red-700">Danger Zone</CardTitle>
                        <CardDescription>Actions that cannot be undone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete Account</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div >
    )
}
