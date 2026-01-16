'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Terminal, Monitor, Power, Clock, RefreshCcw } from 'lucide-react'

export default function InstanceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [instance, setInstance] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [consoleUrl, setConsoleUrl] = useState<string | null>(null)
    const [loadingConsole, setLoadingConsole] = useState(false)

    useEffect(() => {
        const fetchInstance = async () => {
            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                // TODO: Need endpoint to get SINGLE instance by ID. 
                // currently checking instances endpoint returning list and filtering (inefficient but works for small scale)
                const res = await fetch(`${apiUrl}/instances/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    const found = data.find((i: any) => i.id.toString() === params.id)
                    setInstance(found)
                    if (!found) {
                        // Handle 404
                    }
                }
            } catch (error) {
                console.error("Failed to fetch instance", error)
            } finally {
                setLoading(false)
            }
        }
        fetchInstance()
    }, [params.id])

    const handleConsoleOpen = async () => {
        setLoadingConsole(true)
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/instances/${params.id}/console`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setConsoleUrl(data.url)
            } else {
                alert("Failed to get console URL. Instance might be offline.")
            }
        } catch (error) {
            console.error("Failed to get console", error)
        } finally {
            setLoadingConsole(false)
        }
    }

    if (loading) return <div className="p-8">Loading instance details...</div>
    if (!instance) return <div className="p-8">Instance not found.</div>

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Button variant="ghost" className="mb-4" onClick={() => router.push('/dashboard')}>
                ← Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        {instance.os_type === 'windows' ? '🪟' : '🐧'} Instance #{instance.id}
                    </h1>
                    <p className="text-muted-foreground">{instance.ip_address || "Provisioning..."}</p>
                </div>
                <Badge variant={instance.status === 'active' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                    {instance.status.toUpperCase()}
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="console">Web Console</TabsTrigger>
                    <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Monitor className="h-5 w-5" /> Connection Details
                                </h3>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <span className="text-muted-foreground">IP Address:</span>
                                    <span className="col-span-2 font-mono">{instance.ip_address}</span>

                                    <span className="text-muted-foreground">Username:</span>
                                    <span className="col-span-2 font-mono">{instance.username}</span>

                                    <span className="text-muted-foreground">Password:</span>
                                    <span className="col-span-2 font-mono bg-muted p-1 rounded">
                                        {instance.password}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5" /> Lifecycle
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span>{new Date(instance.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Expires:</span>
                                        <span className="text-red-500 font-medium">
                                            {instance.expires_at ? new Date(instance.expires_at).toLocaleDateString() : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="console">
                    <Card className="h-[600px] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-5 w-5" />
                                <span className="font-semibold">Emergency Web Console (NoVNC)</span>
                            </div>
                            <Button size="sm" onClick={handleConsoleOpen} disabled={loadingConsole}>
                                {loadingConsole ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
                                {consoleUrl ? 'Reconnect' : 'Connect to Console'}
                            </Button>
                        </div>
                        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
                            {loadingConsole && <div className="text-white">Connecting to VNC...</div>}

                            {!loadingConsole && !consoleUrl && (
                                <div className="text-center text-muted-foreground">
                                    <p className="mb-2">The console allows you to access your server even if RDP/SSH is down.</p>
                                    <Button onClick={handleConsoleOpen}>Start Session</Button>
                                </div>
                            )}

                            {consoleUrl && (
                                <iframe
                                    src={consoleUrl}
                                    className="w-full h-full border-0"
                                    allow="clipboard-write"
                                />
                            )}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="snapshots">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Snapshots</CardTitle>
                                <CardDescription>Create backups of your instance state.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => alert("Creating snapshot...")}>Create Snapshot</Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">Snapshots are not yet available for this instance type.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
