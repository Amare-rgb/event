import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testEmail() {
  console.log('🔧 Testing DreamMore Email Configuration...');
  console.log('============================================');
  
  // Get email configuration
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.hostinger.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '465');
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  const emailFrom = process.env.EMAIL_FROM || `"DreamMore" <${emailUser}>`;

  console.log(`📧 Configuration:`);
  console.log(`   Host: ${emailHost}`);
  console.log(`   Port: ${emailPort}`);
  console.log(`   User: ${emailUser}`);
  console.log(`   Password: ${emailPass ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   Secure: ${emailSecure}`);
  console.log(`   From: ${emailFrom}`);
  console.log('============================================');

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not set in .env file');
    console.log('Please check your .env file and ensure EMAIL_USER and EMAIL_PASS are set.');
    return;
  }

  // Create transporter for Hostinger
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });

  try {
    console.log('📡 Verifying connection...');
    // Verify connection
    await transporter.verify();
    console.log('✅ Email configuration is valid!');
    console.log('✅ Transporter is ready to send emails');
    console.log('============================================');

    // Send a test email to yourself
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: emailFrom,
      to: emailUser, // Send to yourself
      subject: '✅ Test Email from DreamMore Broadcast System',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DreamMore Test Email</title>
          </head>
          <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f9fc; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 30px 40px; border-bottom: 3px solid #ea580c; text-align: center; background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="color: #ea580c; font-size: 32px; margin: 0;">DreamMore</h1>
                        <p style="color: #6b7280; font-size: 16px; margin: 5px 0 0 0;">Education &amp; Training Platform</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px 40px;">
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c; margin-bottom: 20px;">
                          <h2 style="color: #1f2937; margin-top: 0;">✅ Test Email Successful!</h2>
                          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 10px 0;">
                            This is a test email from the DreamMore broadcast system.
                          </p>
                          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 10px 0;">
                            If you're receiving this, your email configuration is working perfectly!
                          </p>
                        </div>
                        
                        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0;">
                          <p style="color: #166534; font-size: 14px; margin: 0;">
                            📧 <strong>Configuration Details:</strong>
                          </p>
                          <p style="color: #166534; font-size: 12px; margin: 5px 0 0 0;">
                            Host: ${emailHost}<br>
                            Port: ${emailPort}<br>
                            User: ${emailUser}<br>
                            Secure: ${emailSecure}
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 8px 8px;">
                        <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                          This email was sent from DreamMore Admin Panel
                        </p>
                        <p style="font-size: 11px; color: #9ca3af; margin: 5px 0 0 0;">
                          &copy; ${new Date().getFullYear()} DreamMore. All rights reserved.
                        </p>
                        <p style="font-size: 10px; color: #d1d5db; margin: 10px 0 0 0;">
                          For support: support@dreammoredigitals.com
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
DreamMore Education & Training Platform

✅ Test Email Successful!

This is a test email from the DreamMore broadcast system.
If you're receiving this, your email configuration is working perfectly!

Configuration Details:
Host: ${emailHost}
Port: ${emailPort}
User: ${emailUser}
Secure: ${emailSecure}

---
For support: support@dreammoredigitals.com
© ${new Date().getFullYear()} DreamMore. All rights reserved.
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Check your inbox at: ${emailUser}`);
    console.log('============================================');
    console.log('📌 Next Steps:');
    console.log('   1. Check your email inbox');
    console.log('   2. If you received the email, your configuration is working!');
    console.log('   3. You can now send broadcast emails to users.');
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('============================================');
    console.error('Error details:', error);
    console.error('============================================');
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Check EMAIL_USER and EMAIL_PASS in .env');
    console.log('   2. Verify the email account exists in Hostinger');
    console.log('   3. Make sure SMTP is enabled in Hostinger control panel');
    console.log('   4. Try using port 587 (change EMAIL_PORT=587 and EMAIL_SECURE=false)');
    console.log('   5. Contact Hostinger support for correct SMTP settings');
  }
}

// Run the test
testEmail();