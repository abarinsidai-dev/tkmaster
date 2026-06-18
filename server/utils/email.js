const nodemailer = require('nodemailer');

// Reuse a test account if already created to avoid hitting rate limits
let transporter = null;

async function setupEthereal() {
  if (!transporter) {
    // Generate a test account on Ethereal (fake email service for testing)
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log('📧 Ethereal Email initialized. Check server logs after purchases for preview links.');
  }
  return transporter;
}

async function sendReceiptEmail(order, userEmail) {
  try {
    const t = await setupEthereal();

    // Setup email data
    const mailOptions = {
      from: '"tickt Team" <noreply@tickt.com>', 
      to: userEmail,
      subject: `Your Tickets: ${order.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0b; color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #3b82f6; text-align: center;">tickt</h1>
          <h2 style="text-align: center;">You're going to see ${order.eventTitle}!</h2>
          
          <div style="background-color: #1a1a1c; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${order.eventDate}</p>
            <p style="margin: 0 0 10px 0;"><strong>Venue:</strong> ${order.eventVenue}</p>
            <p style="margin: 0 0 10px 0;"><strong>Tickets:</strong> ${order.ticketCount}x ${order.section ? order.section.name : 'General Admission'}</p>
            <hr style="border-color: #333; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;"><strong>Total Paid:</strong> $${order.totalPaid.toFixed(2)}</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            Your tickets are stored digitally in your tickt account. Please log in to view or download them.
          </p>
        </div>
      `,
    };

    // Send the email
    const info = await t.sendMail(mailOptions);

    console.log('----------------------------------------');
    console.log('✉️  Receipt email "sent" via Ethereal!');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Failed to send receipt email:', error);
  }
}

async function sendWaitlistAlert(email, eventTitle, marketplaceUrl) {
  try {
    const t = await setupEthereal();
    const info = await t.sendMail({
      from: '"tickt Team" <noreply@tickt.com>',
      to: email,
      subject: `🎟️ Ticket Available: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0b; color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #3b82f6; text-align: center;">tickt</h1>
          <h2 style="text-align: center;">Good news! A ticket is available.</h2>
          <div style="background-color: #1a1a1c; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p>A ticket for <strong>${eventTitle}</strong> has just been listed in the Resale Marketplace.</p>
            <p>Act fast — tickets sell quickly!</p>
            <a href="${marketplaceUrl}" style="display: inline-block; margin-top: 16px; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View in Marketplace</a>
          </div>
          <p style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">You received this because you joined the waitlist for this event.</p>
        </div>
      `,
    });
    console.log('✉️  Waitlist alert sent! Preview:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Failed to send waitlist alert:', error);
  }
}

async function sendTransferEmail(fromEmail, toEmail, eventTitle) {
  try {
    const t = await setupEthereal();
    // Notify recipient
    const infoTo = await t.sendMail({
      from: '"tickt Team" <noreply@tickt.com>',
      to: toEmail,
      subject: `🎟️ You've received a ticket: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0b; color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #3b82f6; text-align: center;">tickt</h1>
          <h2 style="text-align: center;">You've received a ticket!</h2>
          <div style="background-color: #1a1a1c; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p>A ticket for <strong>${eventTitle}</strong> has been transferred to your account.</p>
            <p>Log in to your tickt account to view it in your Dashboard.</p>
          </div>
        </div>
      `,
    });
    // Notify sender
    const infoFrom = await t.sendMail({
      from: '"tickt Team" <noreply@tickt.com>',
      to: fromEmail,
      subject: `✅ Ticket Transfer Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0b; color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #3b82f6; text-align: center;">tickt</h1>
          <h2 style="text-align: center;">Transfer Confirmed</h2>
          <div style="background-color: #1a1a1c; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p>Your ticket for <strong>${eventTitle}</strong> has been successfully transferred to <strong>${toEmail}</strong>.</p>
          </div>
        </div>
      `,
    });
    console.log('✉️  Transfer emails sent!');
    console.log('Recipient preview:', nodemailer.getTestMessageUrl(infoTo));
    console.log('Sender preview:', nodemailer.getTestMessageUrl(infoFrom));
  } catch (error) {
    console.error('Failed to send transfer email:', error);
  }
}

module.exports = {
  sendReceiptEmail,
  sendWaitlistAlert,
  sendTransferEmail
};
