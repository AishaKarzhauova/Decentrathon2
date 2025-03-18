import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "../.env")
load_dotenv(dotenv_path=dotenv_path)
# load_dotenv()

SMTP_SERVER = "smtp.mailgun.org"  # адрес SMTP-сервера
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_verification_email(recipient_email: str, code: str):
    subject = "Ваш код подтверждения регистрации"
    body = f"Ваш код подтверждения: {code}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = recipient_email

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

# send_verification_email('210107135@stu.sdu.edu.kz', '546532')
