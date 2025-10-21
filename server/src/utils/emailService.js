import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { AppError } from '../middleware/errorMiddleware.js';

dotenv.config();

// Create reusable transporter object with timeout configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true', // Use SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  // Add connection timeout settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000
});

// Track email service status
let emailServiceReady = false;

// Verify transporter configuration asynchronously without blocking startup
const verifyEmailService = async () => {
  try {
    await transporter.verify();
    emailServiceReady = true;
    console.log('SMTP Server is ready to send emails');
    return true;
  } catch (error) {
    emailServiceReady = false;
    console.warn('SMTP Configuration Warning:', error.message);
    console.warn('Email service will retry on next send attempt');
    return false;
  }
};

// Attempt initial verification but don't block startup
verifyEmailService().catch(err => {
  console.warn('Initial SMTP verification failed, will retry on demand');
});

// Generate OTP based on configuration
export const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  const alphabet = process.env.OTP_ALPHABET || '0123456789';
  const digitOnly = process.env.OTP_DIGIT_ONLY === 'true';
  
  let otp = '';
  const chars = digitOnly ? '0123456789' : alphabet;
  
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return otp;
};

const getEmailTemplate = (type, otp) => {
  const templates = {
    'verify-email': {
      subject: 'Verify Your Email - FAMS Cosmetics',
      heading: 'Welcome to FAMS Cosmetics!',
      subheading: 'Please verify your email address',
      message: 'Thank you for joining our beauty community. To complete your registration, please verify your email address using the OTP below:',
      buttonText: 'Verify Email'
    },
    'reset-password': {
      subject: 'Reset Your Password - FAMS Cosmetics',
      heading: 'Password Reset Request',
      subheading: 'You requested to reset your password',
      message: 'To reset your password, please use the OTP code below. If you did not request this, please ignore this email.',
      buttonText: 'Reset Password'
    }
  };

  const template = templates[type] || templates['verify-email'];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 10px 10px 0 0;
          }
          .logo {
            color: white;
            font-size: 36px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .otp-box {
            background: #fff5f7;
            border: 2px solid #ff69b4;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #ff1493;
            letter-spacing: 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          .social-links {
            margin: 20px 0;
            text-align: center;
          }
          .social-links a {
            color: #ff69b4;
            text-decoration: none;
            margin: 0 10px;
          }
          .security-notice {
            background: #f8f9fa;
            border-left: 4px solid #ff69b4;
            padding: 10px 15px;
            margin: 20px 0;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">FAMS</h1>
          </div>
          <div class="content">
            <h2 style="color: #ff1493; text-align: center;">${template.heading}</h2>
            <h3 style="color: #666; text-align: center;">${template.subheading}</h3>
            
            <p>${template.message}</p>
            
            <div class="otp-box">
              <p style="margin: 0;">Your verification code is:</p>
              <div class="otp">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">This code will expire in 10 minutes</p>
            </div>

            <div class="security-notice">
              <p style="margin: 0;">🔒 Security Notice:</p>
              <p style="margin: 5px 0 0 0;">Never share this code with anyone. Our team will never ask for your OTP.</p>
            </div>

            <div class="social-links">
              <p>Follow us for beauty tips and updates:</p>
              <a href="#">Instagram</a> |
              <a href="#">Facebook</a> |
              <a href="#">Twitter</a>
            </div>
          </div>
          <div class="footer">
            <p> FAMS Cosmetics. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
            <p>If you didn't request this email, please ignore it or contact support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Get order confirmation email template
const getOrderConfirmationTemplate = (order) => {
  const items = order.orderItems.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.discountedPrice ? item.discountedPrice.toFixed(2) : item.price.toFixed(2)} EGP</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${((item.discountedPrice || item.price) * item.quantity).toFixed(2)} EGP</td>
    </tr>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - FAMS Cosmetics</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            border-radius: 10px 10px 0 0;
          }
          .logo {
            color: white;
            font-size: 36px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .order-box {
            background: #fff5f7;
            border: 2px solid #ff69b4;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            color: #ff1493;
            text-align: center;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            color: #ff1493;
            border-bottom: 2px solid #ff69b4;
            padding-bottom: 5px;
            font-size: 18px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #fff5f7;
            color: #ff1493;
            padding: 10px;
            text-align: left;
          }
          .total-row {
            font-weight: bold;
          }
          .address-block {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #ff69b4, #ff1493);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
          .social-links {
            margin: 20px 0;
            text-align: center;
          }
          .social-links a {
            color: #ff69b4;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">FAMS</h1>
          </div>
          <div class="content">
            <h2 style="color: #ff1493; text-align: center;">Order Confirmation</h2>
            <h3 style="color: #666; text-align: center;">Thank you for your order!</h3>
            
            <p>Hello ${order.shippingAddress.firstName},</p>
            <p>Thank you for shopping with FAMS Cosmetics. We're pleased to confirm your order.</p>
            
            <div class="order-box">
              <p style="margin: 0; text-align: center;">Your order number is:</p>
              <div class="order-number">${order.orderNumber}</div>
              <p style="margin: 10px 0 0 0; text-align: center;">Placed on: ${new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div class="section">
              <h4 class="section-title">Order Summary</h4>
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px;">Image</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items}
                  <tr class="total-row">
                    <td colspan="4" style="padding: 10px; text-align: right; border-top: 2px solid #eee;">Items Total:</td>
                    <td style="padding: 10px; border-top: 2px solid #eee;">${order.itemsTotal.toFixed(2)} EGP</td>
                  </tr>
                  <tr>
                    <td colspan="4" style="padding: 10px; text-align: right;">Shipping:</td>
                    <td style="padding: 10px;">${order.shippingFee.toFixed(2)} EGP</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="4" style="padding: 10px; text-align: right; font-size: 18px;">Total:</td>
                    <td style="padding: 10px; font-size: 18px; color: #ff1493;">${order.totalAmount.toFixed(2)} EGP</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h4 class="section-title">Shipping Information</h4>
              <div class="address-block">
                <p style="margin: 0;"><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
                <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
                <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.governorate}</p>
                <p style="margin: 5px 0;">${order.shippingAddress.phone}</p>
                <p style="margin: 5px 0;">${order.shippingAddress.email}</p>
              </div>
            </div>

            <div class="section">
              <h4 class="section-title">Delivery Information</h4>
              <p><strong>Delivery Method:</strong> Standard Shipping</p>
              <p><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryTime}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/account" class="button">View Your Order</a>
            </div>

            <div class="social-links">
              <p>Follow us for beauty tips and updates:</p>
              <a href="#">Instagram</a> |
              <a href="#">Facebook</a> |
              <a href="#">Twitter</a>
            </div>
          </div>
          <div class="footer">
            <p> FAMS Cosmetics. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
            <p>If you have any questions about your order, please contact our customer support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Send OTP email with retry logic
export const sendOTPEmail = async (email, otp, type = 'verify-email', retries = 2) => {
  const templates = {
    'verify-email': {
      subject: 'Verify Your Email - FAMS Cosmetics'
    },
    'reset-password': {
      subject: 'Reset Your Password - FAMS Cosmetics'
    }
  };

  const template = templates[type] || templates['verify-email'];

  const mailOptions = {
    from: `"FAMS Cosmetics" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: template.subject,
    html: getEmailTemplate(type, otp)
  };

  // Verify connection if not ready
  if (!emailServiceReady) {
    await verifyEmailService();
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error(`Email send attempt ${attempt + 1}/${retries + 1} failed:`, error.message);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        // Final attempt failed
        console.error('All email send attempts failed for:', email);
        throw new Error(`Failed to send email after ${retries + 1} attempts: ${error.message}`);
      }
    }
  }
};

// Send order confirmation email with retry logic
export const sendOrderConfirmationEmail = async (order, retries = 2) => {
  const mailOptions = {
    from: `"FAMS Cosmetics" <${process.env.SMTP_FROM}>`,
    to: order.shippingAddress.email,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html: getOrderConfirmationTemplate(order)
  };

  // Verify connection if not ready
  if (!emailServiceReady) {
    await verifyEmailService();
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${order.shippingAddress.email}`);
      return true;
    } catch (error) {
      console.error(`Order email attempt ${attempt + 1}/${retries + 1} failed:`, error.message);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        // Final attempt failed - log but don't crash
        console.error('All order email attempts failed for order:', order.orderNumber);
        // Don't throw error - order was placed successfully, email is secondary
        return false;
      }
    }
  }
};