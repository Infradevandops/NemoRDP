# NemoRDP - API Key Setup Guide

This guide will help you obtain the necessary API keys and credentials to run NemoRDP.

## 💳 1. Paystack (Payments)

Paystack processes card payments. For the beta launch, you can start with **Test Mode**.

1. **Sign Up**: Create an account at [paystack.com](https://paystack.com).
2. **Access Dashboard**: Log in to your Paystack dashboard.
3. **Get Keys**:
   - Go to **Settings** > **API Keys & Webhooks**.
   - Copy your **Secret Key** (`sk_test_...` or `sk_live_...`).
   - Copy your **Public Key** (`pk_test_...` or `pk_live_...`).
4. **Configure Webhook**:
   - In the same section, set **Webhook URL** to `https://your-domain.com/webhooks/paystack`.
   - **Note**: For local testing, use a tunneling service like ngrok to expose your local server.

## ☁️ 2. Vultr (Windows RDP)

Vultr is used to provision Windows Server instances via API.

1. **Sign Up**: Create an account at [vultr.com](https://www.vultr.com/).
2. **Add Funds**: You must add a credit card or funds (min $10) to enable API access.
3. **Get API Key**:
   - Go to **Account** > **API**.
   - Click **Enable API**.
   - Copy the **API Key**.
   - **Important**: Add your server's IP address (or `0.0.0.0/0` for all) to the **Access Control** list to allow connections.

## 🐧 3. Contabo (Linux RDP)

Contabo offers cost-effective VPS for Linux instances.

1. **Sign Up**: Create an account at [contabo.com](https://contabo.com/).
2. **Access API**: API access is included with your account.
3. **Get Credentials**:
   - Go to the [API Access section](https://my.contabo.com/api).
   - Generate a new **Client Secret**.
   - Copy your **Client ID** and **Client Secret**.
   - Copy your **API User** (usually your email).

## 📧 4. Email (SMTP)

We use SMTP to send order confirmations and RDP credentials. The easiest way is using a Gmail account.

1. **Google Account**: Use an existing Gmail account or create a new one for your business (e.g., `support.nemordp@gmail.com`).
2. **Enable 2FA**: Go to [Google Account Security](https://myaccount.google.com/security) and enable 2-Step Verification.
3. **Generate App Password**:
   - Go to **2-Step Verification** > **App passwords**.
   - Create a new app password (name it "NemoRDP").
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`).
4. **Configuration**:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **User**: Your full email address
   - **Password**: The 16-character App Password

## ₿ 5. Crypto Wallets

For crypto payments, you need wallet addresses to receive funds.

1. **Create Wallets**: Use a secure wallet like Trust Wallet, Exodus, or a hardware wallet (Ledger).
2. **Get Addresses**:
   - **Bitcoin (BTC)**: Copy your BTC receive address.
   - **Ethereum (ETH)**: Copy your ETH receive address.
   - **USDT (TRC20)**: Copy your USDT (Tron network) receive address.
   - **USDT (ERC20)**: Often same as your ETH address.

## 🔐 6. Google ReCaptcha (Optional)

If you decide to add captcha later:

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin).
2. Create a v2 or v3 site key.
3. Add domains (`localhost` and your production domain).

---

## 📝 Configuration Cheat Sheet

Add these keys to your `.env` file:

```bash
# Paystack
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...

# Vultr
VULTR_API_KEY=...

# Contabo
CONTABO_CLIENT_ID=...
CONTABO_CLIENT_SECRET=...
CONTABO_API_USER=...

# Email
SMTP_USER=support@nemordp.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```
