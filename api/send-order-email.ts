import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// IMPORTANT: Ensure RESEND_API_KEY is set in your Vercel project environment variables!
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { order } = req.body;

  if (!order || !order.customerName || !order.email || !order.items || !order.totalAmount) {
    return res.status(400).json({ message: 'Missing required order details.' });
  }

  try {
    const emailContent = `
      <h1>MOCA Gandhinagar - Order Confirmation</h1>
      <p>Dear ${order.customerName},</p>
      <p>Thank you for your order #${order.id} from MOCA Gandhinagar!</p>
      <p>Here are your order details:</p>
      <ul>
        ${order.items.map((item: any) => `<li>${item.name} (x${item.quantity}) - ₹${item.price / 100}</li>`).join('')}
      </ul>
      <p>Total Amount: ₹${order.totalAmount / 100}</p>
      <p>Status: ${order.status}</p>
      <p>We appreciate your support!</p>
      <p>The MOCA Gandhinagar Team</p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'MOCA Gandhinagar <onboarding@resend.dev>', // Replace with your verified domain in Resend
      to: [order.email],
      subject: `Your MOCA Gandhinagar Order Confirmation #${order.id}`,
      html: emailContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }

    console.log('Order confirmation email sent:', data);
    return res.status(200).json({ message: 'Email sent successfully!', data });
  } catch (error: any) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
}

