const nodemailer = require("nodemailer");
const twilio = require("twilio");

// ==========================================
// EMAIL SETUP
// ==========================================
// Setup nodemailer using SMTP credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "your_email@gmail.com",
    pass: process.env.SMTP_PASS || "your_app_password",
  },
});

// Sends an OTP Verification Key via Email
const sendEmailOTP = async (toEmail, otpCode) => {
  try {
    const mailOptions = {
      from: `"SRSync API SaaS" <${process.env.SMTP_USER || "noreply@srsyncapi.com"}>`,
      to: toEmail,
      subject: "Your Authentication Key",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background-color: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #3b82f6;">Welcome to SRSync API</h2>
          <p style="font-size: 16px; color: #555;">Your verification key is:</p>
          <div style="font-size: 32px; font-weight: bold; margin: 20px; color: #111; letter-spacing: 4px;">
            ${otpCode}
          </div>
          <p style="font-size: 14px; color: #888;">This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email OTP sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("Failed to send Email OTP:", error.message);
    throw new Error("Failed to send email verification key.");
  }
};

// ==========================================
// SMS SETUP
// ==========================================
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Sends an OTP Verification Key via SMS to a Phone Number
const sendSmsOTP = async (toPhone, otpCode) => {
  try {
    if (!twilioClient) {
      console.warn("Twilio credentials not configured! SMS will simulate locally.");
      return;
    }

    await twilioClient.messages.create({
      body: `Your SRSync API authentication key is: ${otpCode}. It expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER || "+1234567890",
      to: toPhone,
    });
    console.log(`SMS OTP sent successfully to ${toPhone}`);
  } catch (error) {
    console.error("Failed to send SMS OTP:", error.message);
    throw new Error("Failed to send SMS verification key.");
  }
};

module.exports = { sendEmailOTP, sendSmsOTP };
