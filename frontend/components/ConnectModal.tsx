'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConnectModalProps {
    instance: {
        id: number
        ip_address: string | null
        username: string | null
        password?: string
    }
    onClose: () => void
}

export function ConnectModal({ instance, onClose }: ConnectModalProps) {
    const [copied, setCopied] = useState<string | null>(null)

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopied(field)
        setTimeout(() => setCopied(null), 2000)
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} copied to clipboard`)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Connect to RDP Server</h2>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={instance.ip_address || 'Pending...'}
                                readOnly
                                className="flex-1 px-3 py-2 border rounded-md bg-muted"
                            />
                            {instance.ip_address && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(instance.ip_address!, 'ip')}
                                >
                                    {copied === 'ip' ? '✓' : 'Copy'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={instance.username || 'Pending...'}
                                readOnly
                                className="flex-1 px-3 py-2 border rounded-md bg-muted"
                            />
                            {instance.username && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(instance.username!, 'username')}
                                >
                                    {copied === 'username' ? '✓' : 'Copy'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Password</label>
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={instance.password || '••••••••'}
                                readOnly
                                className="flex-1 px-3 py-2 border rounded-md bg-muted"
                            />
                            {instance.password && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(instance.password!, 'password')}
                                >
                                    {copied === 'password' ? '✓' : 'Copy'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-muted p-4 rounded-md mb-4">
                    <h3 className="font-semibold mb-2">How to Connect:</h3>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                        <li>Open Remote Desktop Connection (Windows) or Microsoft Remote Desktop (Mac)</li>
                        <li>Enter the IP address above</li>
                        <li>Use the username and password when prompted</li>
                    </ol>
                </div>

                <Button onClick={onClose} className="w-full">
                    Close
                </Button>
            </div>
        </div>
    )
}
