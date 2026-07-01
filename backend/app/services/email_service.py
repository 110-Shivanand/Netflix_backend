import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


class EmailService:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.frontend_url = settings.FRONTEND_URL

    def _send(self, to_email: str, subject: str, html_body: str):
        if not self.username:
            print(f"[Email] Would send to {to_email}: {subject}")
            return
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Netflix Clone <{self.username}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.username, to_email, msg.as_string())
        except Exception as e:
            print(f"[Email Error] {e}")

    def send_verification_email(self, email: str, token: str):
        verify_url = f"{self.frontend_url}/verify-email?token={token}"
        html = f"""
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <h2 style="color: #E50914;">Netflix Clone - Verify Your Email</h2>
            <p>Click the button below to verify your email address:</p>
            <a href="{verify_url}" style="background:#E50914;color:#fff;padding:12px 24px;
               text-decoration:none;border-radius:4px;display:inline-block;margin:16px 0;">
               Verify Email
            </a>
            <p>Link expires in 24 hours.</p>
        </div>
        """
        self._send(email, "Verify your Netflix Clone account", html)

    def send_password_reset_email(self, email: str, token: str):
        reset_url = f"{self.frontend_url}/reset-password?token={token}"
        html = f"""
        <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <h2 style="color: #E50914;">Netflix Clone - Reset Password</h2>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_url}" style="background:#E50914;color:#fff;padding:12px 24px;
               text-decoration:none;border-radius:4px;display:inline-block;margin:16px 0;">
               Reset Password
            </a>
            <p>Link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
        """
        self._send(email, "Reset your Netflix Clone password", html)
