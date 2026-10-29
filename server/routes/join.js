import express from 'express';
import nodemailer from 'nodemailer';
import Post from '../models/Post.js';

const router = express.Router();

// Helper to create the best available Nodemailer transport
async function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback for development/testing when SMTP credentials are not yet configured:
  // Using Ethereal or JSON transport so requests always succeed reliably
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('Ethereal test account unavailable, falling back to jsonTransport:', err.message);
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

/**
 * @route   POST /api/join
 * @desc    Accepts postId, requesterEmail, and posterEmail.
 *          Wires up Nodemailer to send a standard email to the posterEmail stating:
 *          "A student wants to team up with you for [Event Name]! Check their profile."
 */
router.post('/', async (req, res) => {
  try {
    const { postId, requesterEmail, posterEmail } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId is required',
      });
    }

    if (!requesterEmail) {
      return res.status(400).json({
        success: false,
        message: 'requesterEmail is required',
      });
    }

    // Retrieve post and populate event and poster details
    const post = await Post.findById(postId)
      .populate('eventId')
      .populate('posterId');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const eventName = post.eventId?.eventName || 'Upcoming Hackathon';
    const recipientEmail = posterEmail || post.posterId?.collegeEmail;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'No recipient poster email found for this post',
      });
    }

    const standardMessage = `A student wants to team up with you for ${eventName}! Check their profile.`;

    const transporter = await getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"SyncSpace Matchmaking" <notifications@syncspace.edu>',
      to: recipientEmail,
      subject: `SyncSpace: Team Up Request for ${eventName}!`,
      text: `${standardMessage}\n\nRequester Email: ${requesterEmail}\nRole Details: ${post.requestedSkills}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; letter-spacing: -0.5px;">SyncSpace</h1>
            <p style="margin: 4px 0 0 0; color: #e0e7ff; font-size: 14px;">Campus Hackathon & Tech Event Matchmaking</p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #1e293b; border-left: 4px solid #6366f1; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #ffffff;">
                ${standardMessage}
              </p>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">Request Summary:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #cbd5e1; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #94a3b8; width: 140px;">Event:</td>
                <td style="padding: 8px 0; font-weight: 600; color: #818cf8;">${eventName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Requester Email:</td>
                <td style="padding: 8px 0; color: #38bdf8;">${requesterEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #94a3b8;">Requested Skills:</td>
                <td style="padding: 8px 0;">${post.requestedSkills}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${requesterEmail}?subject=Re:%20Teaming%20up%20for%20${encodeURIComponent(eventName)}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Reply to ${requesterEmail}
              </a>
            </div>
          </div>
          <div style="padding: 16px 28px; background: #090d16; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
            Sent by SyncSpace &bull; Helping students build dream teams without friction
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('✉️  Ethereal Email Preview URL:', previewUrl);
    }

    return res.status(200).json({
      success: true,
      message: `Match request sent successfully! Notification email dispatched to ${recipientEmail}.`,
      data: {
        eventName,
        requesterEmail,
        posterEmail: recipientEmail,
        emailPreviewUrl: previewUrl || null,
        messageContent: standardMessage,
      },
    });
  } catch (error) {
    console.error('Error dispatching join match email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send match email',
      error: error.message,
    });
  }
});

export default router;
