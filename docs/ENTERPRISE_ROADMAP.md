# Enterprise Readiness Roadmap

This document outlines the features, improvements, and architectural changes required to transition **NemoRDP** from a Beta MVP to a stable, enterprise-grade SaaS platform.

## 🚨 Phase 1: Critical Stability & Security (Immediate)
*These features are non-negotiable for launching a secure, trustworthy product.*

### 1. Authentication & Integrity
- [ ] **Password Recovery Flow**: Implement "Forgot Password" with secure email tokens.
- [ ] **Email Verification**: Enforce email verification before allowing deployments to prevent abuse.
- [ ] **Session Management**: Implement secure logout (blacklist tokens) and visual "Active Sessions" list for users.
- [ ] **Strict Input Validation**: Upgrade Pydantic to V2 and enforce strict typing on all API inputs to prevent injection attacks.

### 2. Legal & Compliance (Required for Payments)
- [ ] **Terms of Service Page**: Explicit terms covering RDP usage policies (no mining, no illegal activity).
- [ ] **Privacy Policy Page**: Data handling, cookie usage, and GDPR compliance statements.
- [ ] **Refund Policy**: Clear documentation on refund eligibility (required by Paystack/Stripe).
- [ ] **Cookie Consent Banner**: GDPR/CCPA compliant consent manager.

### 3. Frontend Admin Dashboard (The "Control Tower")
*Currently, admin actions require SQL access. We need a UI.*
- [x] **User Management**: Search, ban/unban users, view usage history.
- [ ] **Instance Oversight**: View all active instances across all users, force-terminate abusive servers.
- [x] **Financial Overview**: Real-time view of MRR, failed payments, and churn.
- [ ] **System Health**: UI validation of the `/health` endpoint stats (DB status, Queue depth).

---

## 🛡️ Phase 2: Enterprise Security & Access (Post-Launch)
*Features required to sell to businesses and power users.*

### 1. Advanced Security
- [ ] **Two-Factor Authentication (2FA)**: TOTP (Google Authenticator) integration for user accounts.
- [ ] **Role-Based Access Control (RBAC)**: Distinguish between `Super Admin`, `Support Agent`, and `User`.
- [ ] **Audit Logs**: Immutable logs of all sensitive actions (e.g., "User X deleted Server Y", "Admin Z refunded Payment Q").
- [ ] **Suspicious Activity Detection**: Auto-flag accounts with multiple failed login attempts or unusual IP patterns.

### 2. Infrastructure Reliability
- [ ] **Database Backups**: Automated daily backups to S3/B2 with distinct retention policies.
- [ ] **Disaster Recovery Plan**: Documented execution plan for restoring the service in <4 hours if Vultr/Contabo goes down.
- [ ] **Status Page**: Public-facing status page (e.g., status.nemordp.com) showing uptime.

---

## 💼 Phase 3: Operational Excellence & Scale
*Features that allow the business to scale without linear support costs.*

### 1. Advanced Billing & Plans
- [ ] **Invoicing**: Generate PDF invoices for business customers.
- [ ] **Usage-Based Billing**: Calculate exact uptime costs (e.g., hourly billing) rather than just flat monthly rates.
- [ ] **Coupons & Discounts**: Admin system to generate promo codes.

### 2. Customer Support Automation
- [ ] **Helpdesk Integration**: Replace `mailto:` with Intercom/Zendesk/Chatwoot widget.
- [ ] **Knowledge Base**: Self-hosted searchable FAQ and tutorials (e.g., "How to connect on Mac").
- [ ] **Ticket History**: User view of their past support requests.

### 3. Technical Scalability
- [ ] **Multi-Region Support**: Allow users to deploy RDPs in specific regions (US, EU, Asia) via the UI.
- [ ] **Load Balancing**: Deploy backend behind a load balancer (Nginx/Traefik) for zero-downtime deployments.
- [ ] **Performance Monitoring**: Integrate Sentry (frontend errors) and Datadog/NewRelic (backend APM).

---

## 📊 Feature Checklist to "Stable Enterprise" Status

| Feature Category | Feature Name | Priority | Status |
| :--- | :--- | :--- | :--- |
| **Auth** | Password Reset | High | 🔴 Missing |
| **Auth** | Email Verification | High | 🔴 Missing |
| **Auth** | 2FA (TOTP) | Medium | 🔴 Missing |
| **Admin** | Admin Dashboard UI | High | 🟢 Complete |
| **Admin** | User Ban/Unban | High | 🟢 Complete |
| **Legal** | ToS / Privacy Pages | High | 🔴 Missing |
| **Ops** | Database Backups | High | 🟡 Partial |
| **Ops** | Audit Logging | Medium | 🟡 Backend Only |
| **Ops** | Status Page | Medium | 🔴 Missing |
| **Support** | Ticket System UI | Medium | 🟢 Basic |
| **Billing** | PDF Invoices | Low | 🔴 Missing |
