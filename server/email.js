import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; }
    .wrapper { background-color: #f8f8f8; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; }
    .header { background-color: #E6007E; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px; }
    .content h2 { font-size: 20px; margin-top: 0; margin-bottom: 16px; }
    .content p { line-height: 1.6; margin: 0 0 16px; }
    .button { display: inline-block; background-color: #E6007E; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
    .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #777; }
    .footer a { color: #E6007E; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Devanshi Collection</h1>
      </div>
      <div class="content">
        <h2>${title}</h2>
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Devanshi Collection. All rights reserved.</p>
        <p><a href="https://devanshicollection.com">Visit our website</a> | <a href="https://devanshicollection.com/contact">Contact Us</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendMail(to, subject, htmlContent) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
    to,
    subject,
    html: emailTemplate(subject, htmlContent),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}
