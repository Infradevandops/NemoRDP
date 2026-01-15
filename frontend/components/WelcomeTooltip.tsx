'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface WelcomeTooltipProps {
    onClose: () => void
}

export function WelcomeTooltip({ onClose }: WelcomeTooltipProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">👋 Welcome to NemoRDP!</h2>

                <div className="space-y-3 mb-6 text-sm">
                    <p className="font-semibold">Here's how to get started:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        <li>Click <span className="font-medium text-foreground">"Deploy New Instance"</span> to create your first RDP server</li>
                        <li>Select your plan, duration, and location</li>
                        <li>Complete payment (or auto-provision in dev mode)</li>
                        <li>Wait 2-3 minutes for provisioning</li>
                        <li>Click <span className="font-medium text-foreground">"Connect"</span> to get your credentials</li>
                        <li>Use Remote Desktop app on your PC/Mac to connect</li>
                    </ol>
                </div>

                <div className="bg-muted p-3 rounded-md mb-4">
                    <p className="text-xs text-muted-foreground">
                        <strong>💡 Tip:</strong> Your server will auto-terminate when it expires.
                        Use the "Extend" button to add more time before expiry.
                    </p>
                </div>

                <Button onClick={onClose} className="w-full">
                    Got it!
                </Button>
            </div>
        </div>
    )
}
