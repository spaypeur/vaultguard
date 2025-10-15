import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import EmailService from '../services/email';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('LeadMagnets');

// In-memory storage for demo purposes - in production, use database
interface LeadMagnetCapture {
  id: string;
  email: string;
  leadMagnet: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

const leadCaptures: LeadMagnetCapture[] = [];

// Validation middleware
const validateLeadMagnetCapture = [
  body('email')
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('leadMagnet')
    .isIn(['Ultimate Crypto Security Checklist', 'Dark Web Threat Report 2024', 'Crypto Tax Guide & Calculator', 'Wallet Security Scanner Report'])
    .withMessage('Invalid lead magnet type')
];

// GET /api/lead-magnets/captures - Get all lead captures (admin only)
router.get('/captures', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: leadCaptures,
      total: leadCaptures.length
    });
  } catch (error) {
    logger.error('Error fetching lead captures:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/lead-magnets/capture - Capture lead magnet email
router.post('/capture', validateLeadMagnetCapture, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, leadMagnet } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Check if email already captured for this lead magnet
    const existingCapture = leadCaptures.find(
      capture => capture.email === email && capture.leadMagnet === leadMagnet
    );

    if (existingCapture) {
      return res.status(409).json({
        success: false,
        error: 'Email already captured for this lead magnet'
      });
    }

    // Create new capture record
    const capture: LeadMagnetCapture = {
      id: Date.now().toString(),
      email,
      leadMagnet,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    };

    leadCaptures.push(capture);

    // Send confirmation email
    const emailService = EmailService.getInstance();
    const emailSent = await sendLeadMagnetConfirmationEmail(email, leadMagnet);

    logger.info(`Lead magnet captured: ${email} for ${leadMagnet}`);

    res.status(201).json({
      success: true,
      message: 'Lead magnet captured successfully',
      data: {
        id: capture.id,
        leadMagnet: capture.leadMagnet,
        emailSent
      }
    });

  } catch (error) {
    logger.error('Error capturing lead magnet:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Function to send confirmation email
async function sendLeadMagnetConfirmationEmail(email: string, leadMagnet: string): Promise<boolean> {
  const emailService = EmailService.getInstance();

  if (!emailService.isActive()) {
    logger.warn('Email service not active - skipping confirmation email');
    return false;
  }

  const subject = `Your ${leadMagnet} is Ready!`;
  const downloadUrl = `${process.env.FRONTEND_URL || 'https://vaultguard.io'}/downloads/${leadMagnet.toLowerCase().replace(/\s+/g, '-')}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; margin: 0; font-size: 28px;">VaultGuard</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Elite Crypto Security</p>
        </div>

        <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Your ${leadMagnet} is Ready!</h2>

        <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Thank you for your interest in our professional crypto security tools. Your ${leadMagnet} has been generated and is ready for download.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" style="background-color: #06b6d4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Download Your Report</a>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0;">What You'll Get:</h3>
          <ul style="color: #555; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Professional-grade security analysis</li>
            <li style="margin-bottom: 8px;">Actionable recommendations</li>
            <li style="margin-bottom: 8px;">Industry best practices</li>
            <li style="margin-bottom: 8px;">Ongoing security tips via email</li>
          </ul>
        </div>

        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          <strong>About VaultGuard:</strong> We're cybersecurity professionals with 20+ years of experience protecting critical assets. Our tools are based on real-world expertise, not automated systems.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #888; font-size: 12px; text-align: center;">
          You received this email because you requested a free security tool from VaultGuard.<br>
          Unsubscribe at any time | <a href="${process.env.FRONTEND_URL || 'https://vaultguard.io'}/privacy" style="color: #06b6d4;">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;

  const text = `
    VaultGuard - Your ${leadMagnet} is Ready!

    Thank you for your interest in our professional crypto security tools.

    Your ${leadMagnet} has been generated and is ready for download.

    Download here: ${downloadUrl}

    What You'll Get:
    - Professional-grade security analysis
    - Actionable recommendations
    - Industry best practices
    - Ongoing security tips via email

    About VaultGuard: We're cybersecurity professionals with 20+ years of experience protecting critical assets.

    You received this email because you requested a free security tool from VaultGuard.
    Unsubscribe at any time | Privacy Policy: ${process.env.FRONTEND_URL || 'https://vaultguard.io'}/privacy
  `;

  return await emailService.sendEmail({
    to: email,
    subject,
    html,
    text,
    priority: 'normal'
  });
}

export default router;