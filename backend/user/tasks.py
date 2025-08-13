from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

@shared_task()
def send_verification_email(otp_code, user_email):
    html_message = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.5;
                    color: #0f172a;
                    background-color: #f8fafc;
                }}
                .container {{
                    max-width: 500px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background-color: #ffffff;
                    padding: 32px 24px 0;
                    text-align: center;
                    border-bottom: 1px solid #f1f5f9;
                }}
                .header h1 {{
                    margin: 0 0 8px 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: #0f172a;
                }}
                .header p {{
                    margin: 0 0 24px 0;
                    font-size: 14px;
                    color: #64748b;
                }}
                .content {{
                    padding: 32px 24px;
                    text-align: center;
                }}
                .otp-container {{
                    background-color: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 24px 0;
                }}
                .otp-label {{
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    margin-bottom: 8px;
                }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #0f172a;
                    letter-spacing: 4px;
                    font-family: 'Courier New', monospace;
                }}
                .content p {{
                    color: #475569;
                    font-size: 14px;
                    margin: 16px 0;
                    line-height: 1.6;
                }}
                .warning {{
                    background-color: #fef3c7;
                    border: 1px solid #f59e0b;
                    border-radius: 6px;
                    padding: 12px;
                    margin: 20px 0;
                    font-size: 13px;
                    color: #92400e;
                }}
                .footer {{
                    background-color: #f8fafc;
                    padding: 24px;
                    text-align: center;
                    border-top: 1px solid #f1f5f9;
                }}
                .footer p {{
                    color: #64748b;
                    font-size: 12px;
                    margin: 4px 0;
                }}
                @media only screen and (max-width: 600px) {{
                    .container {{
                        margin: 20px;
                    }}
                    .content {{
                        padding: 24px 16px;
                    }}
                    .header {{
                        padding: 24px 16px 0;
                    }}
                    .otp-code {{
                        font-size: 28px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Verification</h1>
                    <p>Complete your account setup</p>
                </div>
                
                <div class="content">
                    <p>Hi there,</p>
                    <p>Thank you for registering with us! Please use the verification code below to complete your account setup.</p>
                    
                    <div class="otp-container">
                        <div class="otp-label">Your verification code:</div>
                        <div class="otp-code">{otp_code}</div>
                    </div>
                    
                    <p>Enter this code in the verification form to activate your account.</p>
                    
                    <div class="warning">
                        <strong>⏰ Important:</strong> This code will expire in 10 minutes for security reasons.
                    </div>
                    
                    <p>If you didn't create an account with us, you can safely ignore this email.</p>
                </div>
                
                <div class="footer">
                    <p><strong>Thanks,</strong></p>
                    <p><strong>The US Team</strong></p>
                    <p style="margin-top: 12px;">Need help? Contact us at support@yourcompany.com</p>
                </div>
            </div>
        </body>
        </html>
        """
        
    plain_message = f"""
        Email Verification
        
        Hi there,
        
        Thank you for registering with us! Please use the verification code below to complete your account setup.
        
        Your verification code: {otp_code}
        
        Enter this code in the verification form to activate your account.
        
        IMPORTANT: This code will expire in 10 minutes for security reasons.
        
        If you didn't create an account with us, you can safely ignore this email.
        
        Thanks,
        The US Team
        
        Need help? Contact us at support@yourcompany.com
        """
        
    send_mail(
        subject='Email Verification Code - US',
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )
        
        