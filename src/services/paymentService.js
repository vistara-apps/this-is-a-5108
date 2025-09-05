import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../config/supabase';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export class PaymentService {
  // Create subscription checkout session
  static async createSubscriptionCheckout(userId, priceId = 'price_premium_monthly') {
    try {
      const stripe = await stripePromise;
      
      // Call your backend to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          priceId,
          mode: 'subscription',
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/subscription-cancelled`
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) throw stripeError;

      return { error: null };
    } catch (error) {
      console.error('Create subscription checkout error:', error);
      return { error: error.message };
    }
  }

  // Create one-time payment checkout
  static async createOneTimeCheckout(userId, amount, description) {
    try {
      const stripe = await stripePromise;
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          amount,
          description,
          mode: 'payment',
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment-cancelled`
        }
      });

      if (error) throw error;

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) throw stripeError;

      return { error: null };
    } catch (error) {
      console.error('Create one-time checkout error:', error);
      return { error: error.message };
    }
  }

  // Get customer subscription status
  static async getSubscriptionStatus(userId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get subscription status error:', error);
      return { data: null, error: error.message };
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId) {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { data: null, error: error.message };
    }
  }

  // Update subscription
  static async updateSubscription(userId, newPriceId) {
    try {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: { userId, newPriceId }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Update subscription error:', error);
      return { data: null, error: error.message };
    }
  }

  // Get billing portal URL
  static async getBillingPortalUrl(userId) {
    try {
      const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
        body: { 
          userId,
          returnUrl: window.location.origin
        }
      });

      if (error) throw error;
      return { url: data.url, error: null };
    } catch (error) {
      console.error('Get billing portal URL error:', error);
      return { url: null, error: error.message };
    }
  }

  // Validate subscription status locally
  static async validateSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const isActive = data.subscription_status === 'active' || 
                      data.subscription_status === 'trialing';
      
      return { isActive, status: data.subscription_status, error: null };
    } catch (error) {
      console.error('Validate subscription error:', error);
      return { isActive: false, status: 'free', error: error.message };
    }
  }
}

// Stripe Edge Functions (to be deployed to Supabase)
export const STRIPE_EDGE_FUNCTIONS = {
  'create-checkout-session': `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

serve(async (req) => {
  try {
    const { userId, priceId, amount, description, mode, successUrl, cancelUrl } = await req.json()

    // Get or create customer
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const sessionConfig = {
      customer_email: user.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId
      }
    }

    if (mode === 'subscription') {
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [{
        price: priceId,
        quantity: 1,
      }]
    } else {
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
`,

  'webhook-handler': `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    )

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await handleCheckoutCompleted(session)
        break
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        await handleSubscriptionChange(subscription)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId
  
  if (session.mode === 'subscription') {
    await supabase
      .from('users')
      .update({ subscription_status: 'active' })
      .eq('id', userId)
  }
}

async function handleSubscriptionChange(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer)
  
  // Find user by email
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', customer.email)
    .single()

  if (user) {
    const status = subscription.status === 'active' ? 'active' : 'cancelled'
    await supabase
      .from('users')
      .update({ subscription_status: status })
      .eq('id', user.id)
  }
}
`
};

export default PaymentService;
