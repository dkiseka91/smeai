import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { stripe } from '../lib/stripe';
import { authMiddleware } from '../middleware/auth';
import { sendPaymentFailedEmail } from '../services/emailService';
import type Stripe from 'stripe';

const router = Router();

router.post('/checkout', authMiddleware, async (req, res, next) => {
  try {
    const { type, planPrice, documentId } = z.object({
      type: z.enum(['subscription', 'pay_per_doc']),
      planPrice: z.string().optional(),
      documentId: z.string().optional(),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user!.email, name: user!.name });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user!.id }, data: { stripeCustomerId: customerId } });
    }

    if (type === 'subscription' && planPrice) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: planPrice, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: { workspaceId: req.workspaceId! },
      });
      res.json({ url: session.url });
    } else {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        line_items: [{ price_data: { currency: 'usd', unit_amount: 1500, product_data: { name: 'AElevate Document Export' } }, quantity: 1 }],
        success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`,
        metadata: { userId: req.user!.id, documentId: documentId ?? '' },
      });
      res.json({ url: session.url });
    }
  } catch (err) { next(err); }
});

router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.metadata?.workspaceId) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price.id;
          const planMap: Record<string, string> = {
            [process.env.STRIPE_PRICE_ENTREPRENEUR!]: 'ENTREPRENEUR',
            [process.env.STRIPE_PRICE_GROWTH!]: 'GROWTH',
            [process.env.STRIPE_PRICE_CONSULTANT!]: 'CONSULTANT',
            [process.env.STRIPE_PRICE_INSTITUTION!]: 'INSTITUTION',
          };
          const planTier = (planMap[priceId ?? ''] ?? 'FREE') as 'ENTREPRENEUR' | 'GROWTH' | 'CONSULTANT' | 'INSTITUTION';
          await prisma.workspace.update({
            where: { id: session.metadata.workspaceId },
            data: { planTier, stripeSubscriptionId: sub.id, stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000) },
          });
          // Sync planTier to user so planGuard (which reads req.user.planTier) enforces the new limits immediately
          const members = await prisma.workspaceMember.findMany({
            where: { workspaceId: session.metadata.workspaceId },
            select: { userId: true },
          });
          if (members.length > 0) {
            await prisma.user.updateMany({
              where: { id: { in: members.map(m => m.userId) } },
              data: { planTier },
            });
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const ws = await prisma.workspace.findFirst({ where: { stripeSubscriptionId: sub.id } });
        await prisma.workspace.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { planTier: 'FREE', stripeSubscriptionId: null },
        });
        if (ws) {
          const members = await prisma.workspaceMember.findMany({
            where: { workspaceId: ws.id },
            select: { userId: true },
          });
          if (members.length > 0) {
            await prisma.user.updateMany({
              where: { id: { in: members.map(m => m.userId) } },
              data: { planTier: 'FREE' },
            });
          }
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer_email) {
          const user = await prisma.user.findFirst({ where: { email: invoice.customer_email } });
          if (user) await sendPaymentFailedEmail(user.email, user.name);
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (err) { next(err); }
});

router.get('/portal', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: { code: 'NO_CUSTOMER', message: 'No Stripe customer found' } });
      return;
    }
    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings`,
    });
    res.json({ url: portal.url });
  } catch (err) { next(err); }
});

export default router;
