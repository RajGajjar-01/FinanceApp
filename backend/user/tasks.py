from django.core.mail import send_mail
from celery import shared_task
from django.conf import settings

@shared_task()
def send_verification_email(verification_token, user_email):
    verification_url = f"http://localhost:8000/user/auth/verify-email?token={verification_token}"
      
    html_message = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f8f9fa;
                border: 1px solid black;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                letter-spacing: -0.5px;
            }}
            .content {{
                padding: 40px 30px;
                text-align: center;
            }}
            .content h2 {{
                color: #2d3748;
                font-size: 24px;
                margin-bottom: 20px;
                font-weight: 600;
            }}
            .content p {{
                color: #4a5568;
                font-size: 16px;
                margin-bottom: 20px;
                line-height: 1.6;
            }}
            .button-container {{
                margin: 40px 0;
                text-align: center;
            }}
            .verify-button {{
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }}
            .verify-button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }}
            .expiry-notice {{
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 30px 0;
                color: #856404;
                font-size: 14px;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }}
            .footer p {{
                color: #6c757d;
                font-size: 14px;
                margin: 5px 0;
            }}
            .security-note {{
                background-color: #e8f4fd;
                border-left: 4px solid #3182ce;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .security-note p {{
                color: #2c5282;
                font-size: 14px;
                margin: 0;
            }}
            @media only screen and (max-width: 600px) {{
                .container {{
                    margin: 0 10px;
                }}
                .content {{
                    padding: 30px 20px;
                }}
                .header {{
                    padding: 30px 20px;
                }}
                .verify-button {{
                    padding: 14px 30px;
                    font-size: 15px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to US!</h1>
            </div>
            
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hi there,</p>
                <p>Thank you for joining us! To complete your account setup and ensure the security of your account, please verify your email address by clicking the button below.</p>
                
                <div class="button-container">
                    <a href="{verification_url}" class="verify-button">Verify Email Address</a>
                </div>
                
                <div class="expiry-notice">
                    <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
                </div>
                
                <div class="security-note">
                    <p><strong>Security Note:</strong> If you didn't create an account with us, you can safely ignore this email. Your email address will not be used without verification.</p>
                </div>
                
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea; font-size: 14px;">{verification_url}</p>
            </div>
            
            <div class="footer">
                <p><strong>Thanks,</strong></p>
                <p><strong>The US Team</strong></p>
                <p style="margin-top: 20px;">Need help? Contact us at support@yourcompany.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Enhanced plain text version
    plain_message = f"""
    Welcome to US!
    
    Hi there,
    
    Thank you for joining us! To complete your account setup and ensure the security of your account, please verify your email address by clicking the link below:
    
    {verification_url}
    
    IMPORTANT: This verification link will expire in 24 hours for security reasons.
    
    If you didn't create an account with us, you can safely ignore this email. Your email address will not be used without verification.
    
    Thanks,
    The US Team
    
    Need help? Contact us at support@yourcompany.com
    """    
 
    send_mail(
        subject='Verify your email address - US',
        message=plain_message,
        html_message=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )
    