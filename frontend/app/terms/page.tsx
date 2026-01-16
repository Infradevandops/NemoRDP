import Link from "next/link"

export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground">Last updated: January 2026</p>

                <section>
                    <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p>By accessing and using NemoRDP ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                    <p>NemoRDP provides automated Remote Desktop Protocol (RDP) server provisioning services hosted on third-party infrastructure providers including but not limited to DigitalOcean, Vultr, and Contabo.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">3. Acceptable Use Policy</h2>
                    <p>You agree NOT to use the Service for any of the following prohibited activities:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Mining cryptocurrencies (Bitcoin, Monero, etc.) on standard instances.</li>
                        <li>Sending unsolicited bulk email (SPAM).</li>
                        <li>Hosting or distributing illegal content, malware, or phishing sites.</li>
                        <li>Launching DDoS attacks or scanning external networks.</li>
                        <li>Any activity that violates the Terms of Service of our underlying providers (Vultr/Contabo).</li>
                    </ul>
                    <p className="mt-4 font-bold text-red-600">Violation of these terms will result in immediate termination of your instance without refund.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">4. Payments and Refunds</h2>
                    <p><strong>Payments:</strong> We accept payments via Paystack (Cards, Bank Transfer) and select Cryptocurrencies.</p>
                    <p><strong>Refunds:</strong> Refunds are only issued if we fail to deliver a working RDP instance within 24 hours of payment. Once an instance is provisioned and accessible, no refunds will be granted due to the consumable nature of the service.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
                    <p>NemoRDP is not liable for data loss. You are responsible for backing up your own data. The service is provided "as is" without warranties of any kind.</p>
                </section>

                <div className="pt-8 border-t mt-8">
                    <Link href="/" className="text-primary hover:underline">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
