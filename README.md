# NemoRDP - API-Powered RDP Marketplace

**The High-Velocity, Zero-Maintenance RDP Standalone Seller.**

NemoRDP is a specialized release of the RDP SaaS platform optimized for high-volume reselling. It utilizes a lean, API-driven runtime to provision virtual desktops instantly via global cloud providers.

---

## 🚀 The Standalone Blueprint

NemoRDP is designed to operate as a standalone business unit using "Series One" infrastructure architecture:

1.  **API-First Provisioning**: Utilizes the "100 runtime" provider API keys for instant inventory.
2.  **Zero CapEx**: No hardware to maintain. Scale instantly by increasing API quotas.
3.  **Cross-Provider Compatibility**: Native support for **Vultr** (Windows/GPU) and **Contabo** (Linux).
4.  **Instant Deployment**: From payment to desktop credentials in under 5 minutes.

## 🛠️ Technology Stack

-   **Frontend**: Next.js 14 + Shadcn UI + Tailwind CSS
-   **Backend**: FastAPI (Python)
-   **Task Worker**: Celery + Redis
-   **Database**: PostgreSQL
-   **Integration**: Vultr API & Contabo API

## 📋 First Launch Requirements

To launch NemoRDP as a standalone seller, configure the following:

-   **Runtime Keys**: Vultr API Key (with 100+ instance limit)
-   **Payments**: Paystack Secret Key
-   **Email**: SMTP Credentials (SendGrid/Mailgun)
-   **Infrastructure**: A standard Ubuntu 22.04 VPS for the control plane

## 📈 Roadmap

### Phase 1: Pure Reselling (Current)
-   [x] Mock API Testing Mode
-   [ ] Production API Integration
-   [ ] Automated Expiry Management
-   [ ] Hourly Usage Metering

### Phase 2: Optimization
-   [ ] Multi-region redundancy
-   [ ] Advanced Firewall Management
-   [ ] Team seating/sharing

---

*Powered by the AtlanticRDP Series One Core Architecture.*
