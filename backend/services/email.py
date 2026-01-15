import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.sendgrid.net") # Default SendGrid
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@nemordp.com")

    async def send_rdp_credentials(self, to_email: str, credentials: dict, os_type: str):
        """Send RDP credentials to user"""
        if not self.smtp_username:
             print(f"SMTP Credentials missing. Mocking email to {to_email}")
             print(f"Credentials: {credentials}")
             return

        subject = f"Your NemoRDP {str(os_type).split('.')[-1].title()} Server is Ready! 🚀"
        
        template = Template(self._get_credentials_template())
        html_content = template.render(
            os_type=str(os_type).split('.')[-1].title(),
            ip_address=credentials['ip_address'],
            username=credentials['username'],
            password=credentials['password'],
            rdp_port=3389
        )
        
        await self._send_email(to_email, subject, html_content)

    def _get_credentials_template(self) -> str:
        # Use simple string template for now, or read from file
        return """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .credentials-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin: 20px 0; }
        .cred-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .cred-item:last-child { border-bottom: none; }
        .cred-label { font-weight: 600; color: #64748b; font-size: 14px; }
        .cred-value { font-family: 'Consolas', 'Monaco', monospace; color: #0f172a; font-weight: 600; font-size: 15px; }
        .instructions { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px; margin-top: 30px; }
        .instructions h3 { margin-top: 0; color: #1e40af; font-size: 16px; }
        .instructions ol { margin-bottom: 0; padding-left: 20px; color: #334155; }
        .instructions li { margin-bottom: 8px; }
        .btn-container { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; transition: background 0.3s; }
        .btn:hover { background: #2563eb; }
        .footer { text-align: center; color: #94a3b8; font-size: 13px; padding: 30px; border-top: 1px solid #f1f5f9; background: #f8fafc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Your {{ os_type }} Server is Ready</h1>
            <p>You can now connect to your secure remote desktop.</p>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            <p>Your RDP instance has been successfully provisioned and is ready for use. Here are your connection details:</p>
            
            <div class="credentials-box">
                <div class="cred-item">
                    <span class="cred-label">IP Address</span>
                    <span class="cred-value">{{ ip_address }}</span>
                </div>
                <div class="cred-item">
                    <span class="cred-label">Port</span>
                    <span class="cred-value">{{ rdp_port }}</span>
                </div>
                <div class="cred-item">
                    <span class="cred-label">Username</span>
                    <span class="cred-value">{{ username }}</span>
                </div>
                <div class="cred-item">
                    <span class="cred-label">Password</span>
                    <span class="cred-value">{{ password }}</span>
                </div>
            </div>
            
            <div class="instructions">
                <h3>Quick Connect Guide</h3>
                <ol>
                    <li>Open your preferred RDP Client (Remote Desktop Connection, Remmina, etc.)</li>
                    <li>Enter the IP address: <strong>{{ ip_address }}</strong></li>
                    <li>Enter the credentials provided above when prompted.</li>
                </ol>
            </div>

            <div class="btn-container">
                <a href="https://nemordp.com/dashboard" class="btn">Manage Server</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Reply to this email or visit our <a href="https://nemordp.com/support" style="color: #3b82f6;">Support Center</a>.</p>
            <p>&copy; 2026 NemoRDP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """

    async def _send_email(self, to_email: str, subject: str, html_content: str):
        """Send email via SMTP"""
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = to_email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        try:
            # Note: synchronous standard library call in async function is blocking
            # ideally run in threadpool or use aiosmtplib. For low volume this is "ok" for mvp
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
        except Exception as e:
            # Log error but don't fail the provisioning
            print(f"Email sending failed: {e}")
