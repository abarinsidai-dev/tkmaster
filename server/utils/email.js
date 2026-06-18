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

module.exports = {
  sendReceiptEmail
};
