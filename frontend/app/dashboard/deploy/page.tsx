'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const PLANS = {
    basic: {
        name: 'Basic',
        cpu: '2 vCPU',
        ram: '4GB RAM',
        hourly: 0.75,
        weekly: 8,
        monthly: 15
    },
    pro: {
        name: 'Pro',
        cpu: '4 vCPU',
        ram: '8GB RAM',
        hourly: 1.25,
        weekly: 12,
        monthly: 25
    }
}

const LOCATIONS = [
    { value: 'US', label: 'United States (New Jersey)' },
    { value: 'EU', label: 'Europe (Frankfurt)' },
    { value: 'ASIA', label: 'Asia (Singapore)' }
]

function DeployContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [plan, setPlan] = useState<'basic' | 'pro'>('basic')
    const [duration, setDuration] = useState<'hourly' | 'weekly' | 'monthly'>('monthly')

    useEffect(() => {
        const planParam = searchParams.get('plan')
        if (planParam && (planParam === 'basic' || planParam === 'pro')) {
            setPlan(planParam)
        }
    }, [searchParams])
    const [hours, setHours] = useState(2)
    const [location, setLocation] = useState('US')
    const [osType, setOsType] = useState<'windows' | 'linux'>('linux')
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'crypto'>('paystack')
    const [cryptoType, setCryptoType] = useState('BTC')
    const [loading, setLoading] = useState(false)

    // New State for OS Catalog
    const [osOptions, setOsOptions] = useState<any[]>([])
    const [selectedOsId, setSelectedOsId] = useState('')
    const [loadingOptions, setLoadingOptions] = useState(false)

    // SSH Key State
    const [sshKeys, setSshKeys] = useState<any[]>([])
    const [selectedSshKey, setSelectedSshKey] = useState('')

    // Fetch OS Options when Type Changes
    useEffect(() => {
        const fetchOsOptions = async () => {
            setLoadingOptions(true)
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                // Use public endpoint, no auth needed technically for options, but good practice
                const res = await fetch(`${apiUrl}/options/os?type=${osType}`)
                if (res.ok) {
                    const data = await res.json()
                    setOsOptions(data)
                    if (data.length > 0) {
                        setSelectedOsId(data[0].id)
                    }
                }
            } catch (e) {
                console.error("Failed to fetch OS options", e)
            } finally {
                setLoadingOptions(false)
            }
        }
        fetchOsOptions()
    }, [osType])

    // Fetch SSH Keys
    useEffect(() => {
        const fetchSshKeys = async () => {
            try {
                const token = localStorage.getItem('token')
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/ssh-keys/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) setSshKeys(await res.json())
            } catch (e) {
                console.error("Failed to fetch SSH keys", e)
            }
        }
        fetchSshKeys()
    }, [])

    const calculatePrice = () => {
        if (duration === 'hourly') {
            return (PLANS[plan].hourly * hours).toFixed(2)
        }
        return PLANS[plan][duration].toFixed(2)
    }

    const handleDeploy = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/billing/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    plan,
                    duration,
                    hours: duration === 'hourly' ? hours : undefined,
                    payment_method: paymentMethod,
                    crypto_type: paymentMethod === 'crypto' ? cryptoType : undefined,
                    os_type: osType,
                    os_specific_id: selectedOsId,
                    ssh_key_ids: selectedSshKey ? [parseInt(selectedSshKey)] : [],
                    location
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.payment_url) {
                    window.location.href = data.payment_url
                } else if (data.wallet_address) {
                    // Show crypto instructions
                    alert(`To complete your order, please send ${data.amount} ${data.currency} to:\n\n${data.wallet_address}\n\nYour server will be provisioned once confirmed. Reference: ${data.order_id}`)
                    router.push('/dashboard')
                } else {
                    alert('Deployment initiated! Check your dashboard in a few minutes.')
                    router.push('/dashboard')
                }
            } else {
                const error = await response.json()
                alert(`Error: ${error.detail || 'Failed to initiate deployment'}`)
            }
        } catch (error) {
            console.error('Deployment error:', error)
            alert('Failed to initiate deployment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="max-w-4xl mx-auto w-full">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="mr-4">
                        ← Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Deploy New RDP Server</h1>
                        <p className="text-muted-foreground">Configure your Windows RDP instance</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* OS Selection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Select Operating System</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setOsType('windows')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${osType === 'windows'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold text-lg mb-2">Windows Server</h3>
                                <p className="text-sm text-muted-foreground">Standard RDP Experience</p>
                            </div>
                            <div
                                onClick={() => setOsType('linux')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${osType === 'linux'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold text-lg mb-2">Linux (Ubuntu)</h3>
                                <p className="text-sm text-muted-foreground">High Performance, Cost Effective</p>
                            </div>
                        </div>

                        {/* Granular OS Version Selection */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Select OS Version</label>
                            <select
                                value={selectedOsId}
                                onChange={(e) => setSelectedOsId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                disabled={loadingOptions}
                            >
                                {loadingOptions ? (
                                    <option>Loading options...</option>
                                ) : osOptions.length > 0 ? (
                                    osOptions.map((opt: any) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))
                                ) : (
                                    <option>No options available</option>
                                )}
                            </select>
                        </div>

                        {/* SSH Key Selection (Linux Only) */}
                        {osType === 'linux' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">SSH Key (Optional for Linux)</label>
                                <select
                                    value={selectedSshKey}
                                    onChange={(e) => setSelectedSshKey(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="">No SSH Key (Password Only)</option>
                                    {sshKeys.map((key: any) => (
                                        <option key={key.id} value={key.id}>
                                            {key.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">Manage keys in Settings.</p>
                            </div>
                        )}
                    </div>

                    {/* Plan Selection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Select Plan</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(PLANS).map(([key, planData]) => (
                                <div
                                    key={key}
                                    onClick={() => setPlan(key as 'basic' | 'pro')}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${plan === key
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <h3 className="font-bold text-lg mb-2">{planData.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-1">{planData.cpu}</p>
                                    <p className="text-sm text-muted-foreground">{planData.ram}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Select Duration</h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div
                                onClick={() => setDuration('hourly')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${duration === 'hourly'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold mb-1">Hourly</h3>
                                <p className="text-2xl font-bold text-primary">${PLANS[plan].hourly}/hr</p>
                                <p className="text-xs text-muted-foreground mt-1">Min 2 hours</p>
                            </div>
                            <div
                                onClick={() => setDuration('weekly')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${duration === 'weekly'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold mb-1">Weekly</h3>
                                <p className="text-2xl font-bold text-primary">${PLANS[plan].weekly}</p>
                                <p className="text-xs text-muted-foreground mt-1">7 days</p>
                            </div>
                            <div
                                onClick={() => setDuration('monthly')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${duration === 'monthly'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold mb-1">Monthly</h3>
                                <p className="text-2xl font-bold text-primary">${PLANS[plan].monthly}</p>
                                <p className="text-xs text-muted-foreground mt-1">30 days - Best Value</p>
                            </div>
                        </div>

                        {duration === 'hourly' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">
                                    Number of Hours (2-720)
                                </label>
                                <input
                                    type="number"
                                    min="2"
                                    max="720"
                                    value={hours}
                                    onChange={(e) => setHours(Math.max(2, Math.min(720, parseInt(e.target.value) || 2)))}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        )}
                    </div>
                    {/* Location Selection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Select Location</h2>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            {LOCATIONS.map((loc) => (
                                <option key={loc.value} value={loc.value}>
                                    {loc.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setPaymentMethod('paystack')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paystack'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold">Credit/Debit Card</h3>
                                <p className="text-sm text-muted-foreground">Secure payment via Paystack</p>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('crypto')}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'crypto'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-bold">Cryptocurrency</h3>
                                <p className="text-sm text-muted-foreground">BTC, ETH, USDT</p>
                            </div>
                        </div>

                        {paymentMethod === 'crypto' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-2">Select Currency</label>
                                <select
                                    value={cryptoType}
                                    onChange={(e) => setCryptoType(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="ETH">Ethereum (ETH)</option>
                                    <option value="USDT">Tether (USDT - TRC20)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Summary & Deploy */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-medium">
                                    {osOptions.find((o: any) => o.id === selectedOsId)?.name || (osType === 'windows' ? 'Windows' : 'Linux')} - {PLANS[plan].name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium capitalize">
                                    {duration === 'hourly' ? `${hours} hours` : duration}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Location:</span>
                                <span className="font-medium">{LOCATIONS.find(l => l.value === location)?.label}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-primary">${calculatePrice()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeploy}
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Processing...' : 'Deploy Server'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

export default function DeployPage() {
    return (
        <Suspense fallback={<div>Loading deploy options...</div>}>
            <DeployContent />
        </Suspense>
    )
}
