# NemoRDP

NemoRDP is a modern, SaaS-based Remote Desktop Protocol (RDP) provisioning platform. It allows users to purchase, manage, and connect to high-performance Windows and Linux RDP servers in seconds.

## 🌟 Features

- **Instant Provisioning**: Automated deployment of Windows Server and Linux instances via Vultr/Contabo APIs.
- **Flexible Billing**: Hourly, Weekly, and Monthly billing plans with dynamic pricing.
- **Crypto & Card Payments**: Integrated Stripe/Paystack for cards and direct crypto wallet support.
- **User Dashboard**:
  - Real-time instance status and expiry countdown.
  - "One-click" connection details.
  - Extend subscriptions and manage power cycles (Reboot/Terminate).
- **Secure Architecture**: Decoupled frontend/backend with robust JWT authentication.

## 🏗️ Architecture

We employ a **Fig Strangler** inspired architecture (Decoupled, Service-Oriented):
- **Frontend**: Next.js 14+ (React) with Tailwind CSS and Shadcn UI.
- **Backend**: FastAPI (Python) for high-performance REST APIs.
- **Async Workers**: Celery & Redis for handling long-running provisioning tasks.
- **Database**: PostgreSQL for reliable relational data persistence.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Infradevandops/NemoRDP.git
   cd NemoRDP
   ```

2. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your API keys (Vultr, Paystack, etc.)
   ```

3. **Launch Stack**
   ```bash
   docker-compose up -d --build
   ```

4. **Access Application**
   - Frontend: `http://localhost:3000`
   - API Docs: `http://localhost:8000/docs`

For detailed production deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🧪 Testing

### Frontend Tests
We use **Jest** and **React Testing Library** for component and unit testing.

```bash
cd frontend
npm install
npm test
```

### Backend Tests
(Coming soon: Pytest suite)

## 📂 Project Structure

```
NemoRDP/
├── backend/            # FastAPI Application
│   ├── routers/        # API Endpoints
│   ├── models/         # SQLAlchemy Models
│   ├── services/       # Business Logic (Provisioning, Billing)
│   └── providers/      # Cloud Provider Integrations (Vultr, Contabo)
├── frontend/           # Next.js Application
│   ├── app/            # App Router Pages
│   ├── components/     # Reusable UI Components
│   └── lib/            # Utilities
├── docs/               # Documentation
└── docker-compose.yml  # Local Development Orchestration
```

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
