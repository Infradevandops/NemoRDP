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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .credentials { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .cred-item { margin: 10px 0; }
        .cred-label { font-weight: bold; color: #495057; }
        .cred-value { font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 4px; }
        .instructions { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your {{ os_type }} RDP is Ready!</h1>
            <p>Connect to your remote desktop in seconds</p>
        </div>
        
        <div class="credentials">
            <h3>Connection Details:</h3>
            <div class="cred-item">
                <span class="cred-label">IP Address:</span>
                <span class="cred-value">{{ ip_address }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Port:</span>
                <span class="cred-value">{{ rdp_port }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Username:</span>
                <span class="cred-value">{{ username }}</span>
            </div>
            <div class="cred-item">
                <span class="cred-label">Password:</span>
                <span class="cred-value">{{ password }}</span>
            </div>
        </div>
        
        <div class="instructions">
            <h3>Quick Connect:</h3>
            <ol>
                <li><strong>Windows:</strong> Search "Remote Desktop Connection"</li>
                <li><strong>Mac:</strong> Download "Microsoft Remote Desktop" from App Store</li>
                <li><strong>Linux:</strong> Use Remmina or similar RDP client</li>
                <li>Enter the IP address: <code>{{ ip_address }}</code></li>
                <li>Use the credentials above to login</li>
            </ol>
        </div>
        
        <div class="footer">
            <p>Need help? Reply to this email or visit our support center.</p>
            <p>© 2024 NemoRDP. All rights reserved.</p>
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
