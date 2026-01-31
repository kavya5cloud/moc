import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for updating order status
const supabase = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
  ? createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    )
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Verify webhook signature (optional but recommended)
  // Cashfree sends a signature in headers for verification
  const signature = req.headers['x-cashfree-signature'];
  // TODO: Implement signature verification using your webhook secret

  const { orderId, orderAmount, paymentStatus, paymentMessage, paymentTime } = req.body;

  if (!orderId || !paymentStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Update order status in Supabase based on payment status
    if (supabase) {
      const newStatus = paymentStatus === 'SUCCESS' ? 'Fulfilled' : 'Pending';
      
      // Get the existing order
      const { data: existingOrder, error: fetchError } = await supabase
        .from('shop_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching order:', fetchError);
      }

      if (existingOrder) {
        // Update order with payment information
        const { error: updateError } = await supabase
          .from('shop_orders')
          .update({
            status: newStatus,
            payment_status: paymentStatus,
            payment_message: paymentMessage,
            payment_time: paymentTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Error updating order:', updateError);
          return res.status(500).json({ message: 'Failed to update order status' });
        }

        console.log(`Order ${orderId} updated to status: ${newStatus}`);
      } else {
        // Order not found in Supabase, log for manual review
        console.warn(`Order ${orderId} not found in database`);
      }
    } else {
      // If Supabase is not configured, log the webhook data
      console.log('Webhook received (Supabase not configured):', {
        orderId,
        paymentStatus,
        paymentMessage,
      });
    }

    // Always return 200 to acknowledge receipt of webhook
    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent Cashfree from retrying
    return res.status(200).json({ message: 'Webhook received but processing failed' });
  }
}

