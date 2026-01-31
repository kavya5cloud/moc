import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cashfree API endpoints
const CASHFREE_API_BASE = process.env.CASHFREE_MODE === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderId, amount, customerName, customerEmail, customerPhone, returnUrl } = req.body;

  // Validate required fields
  if (!orderId || !amount || !customerName || !customerEmail || !returnUrl) {
    return res.status(400).json({ 
      message: 'Missing required fields: orderId, amount, customerName, customerEmail, returnUrl' 
    });
  }

  // Validate Cashfree credentials
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    console.error('Cashfree credentials missing');
    return res.status(500).json({ 
      message: 'Payment gateway configuration error. Please contact support.' 
    });
  }

  try {
    // Create payment session with Cashfree
    const cashfreeResponse = await fetch(`${CASHFREE_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customerEmail,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || '',
        },
        order_meta: {
          return_url: returnUrl,
          notify_url: `${process.env.VERCEL_URL || 'https://your-domain.vercel.app'}/api/cashfree-webhook`,
        },
      }),
    });

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error('Cashfree API error:', cashfreeData);
      return res.status(500).json({ 
        message: 'Failed to create payment session',
        error: cashfreeData.message || 'Unknown error'
      });
    }

    // Return payment session ID to frontend
    return res.status(200).json({
      paymentSessionId: cashfreeData.payment_session_id,
      orderId: cashfreeData.order_id,
    });
  } catch (error: any) {
    console.error('Payment session creation error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

