import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const plans = [
  { name: 'Free',         monthlyPrice: 0,   annualPrice: 0,   tag: 'Try it out',         highlight: false, features: ['1 business plan/month','1 pitch deck/month','10 AI advisor queries','Watermarked DOCX exports','Community support'] },
  { name: 'Entrepreneur', monthlyPrice: 19,  annualPrice: 16,  tag: 'Solo founder',        highlight: false, features: ['Unlimited plans & decks','Unlimited AI advisor','Clean exports — no watermark','1 workspace seat','DOCX + PPTX + XLSX export','Email support'] },
  { name: 'Growth',       monthlyPrice: 49,  annualPrice: 41,  tag: 'Growing team',        highlight: true,  features: ['Everything in Entrepreneur','3 workspace seats','Priority AI generation','Financial model deep-dive','PDF exports','Priority support'] },
  { name: 'Consultant',   monthlyPrice: 99,  annualPrice: 82,  tag: 'Business advisors',   highlight: false, features: ['Everything in Growth','10 workspace seats','Client workspaces','White-label document exports','Bulk generation','Dedicated account manager'] },
  { name: 'Institution',  monthlyPrice: 299, annualPrice: 249, tag: 'Banks & incubators',  highlight: false, features: ['Everything in Consultant','50 workspace seats','REST API access','Custom branding','SLA guarantee','Custom integrations'] },
];

const faqs = [
  ['Can I upgrade or downgrade at any time?', 'Yes, you can change your plan at any time. Upgrades take effect immediately; downgrades apply at the end of the billing period.'],
  ['What happens to my documents if I downgrade?', 'Your documents are preserved. On the Free plan, new generations are limited but existing content remains accessible.'],
  ['Is pay-per-document available?', 'Yes — $15 per document for users on the Free plan who need a one-time clean export without upgrading.'],
  ['What currencies do you accept?', 'We accept all major cards via Stripe. Prices are in USD; local currency conversion shown at checkout.'],
  ['Do you offer NGO or educational discounts?', 'Yes — contact hello@aelevate.co.ug with your organisation details for a custom quote.'],
  ['How is the financial model calculated?', 'Pure TypeScript — no AI. We use standard PMT amortisation formulas and 36-month projections based on your inputs.'],
  ['Can I white-label the exports?', 'White-label is available on the Consultant and Institution plans.'],
  ['Is there a free trial for paid plans?', 'The Free plan serves as an open-ended trial. No time-limited trials on paid plans currently.'],
  ['How secure is my business data?', 'All data is encrypted at rest and in transit. We never use your business data to train AI models.'],
  ['What AI model powers the platform?', 'Claude by Anthropic — the same AI used by leading enterprises globally.'],
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-light-grey font-opensans">
      <div className="bg-navy py-12 px-6 text-center">
        <h1 className="font-montserrat font-bold text-3xl text-white mb-3">Plans & Pricing</h1>
        <p className="text-white/60 text-sm mb-6">Start free. Scale as you grow.</p>
        <div className="inline-flex items-center bg-white/10 rounded-full p-1">
          <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${!annual ? 'bg-amber text-navy' : 'text-white/70'}`}>Monthly</button>
          <button onClick={() => setAnnual(true)}  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${annual  ? 'bg-amber text-navy' : 'text-white/70'}`}>
            Annual <span className="text-xs font-normal opacity-80">— save 17%</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plans.map(plan => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div key={plan.name} className={`bg-white rounded-2xl p-6 flex flex-col border-2 transition-shadow ${plan.highlight ? 'border-amber shadow-2xl' : 'border-transparent shadow'}`}>
                {plan.highlight && <div className="text-center mb-3"><span className="bg-amber text-navy text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span></div>}
                <h2 className="font-montserrat font-bold text-navy text-xl">{plan.name}</h2>
                <p className="text-steel-grey text-xs mb-4">{plan.tag}</p>
                <div className="mb-6">
                  <span className="text-4xl font-montserrat font-bold text-navy">${price}</span>
                  {price > 0 && <span className="text-steel-grey text-sm">/{annual ? 'mo (billed annually)' : 'mo'}</span>}
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark-grey">
                      <CheckCircle size={15} className="text-success mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register"
                  className={`mt-6 block text-center py-3 rounded-xl font-montserrat font-bold text-sm transition-colors ${plan.highlight ? 'bg-amber text-navy hover:bg-amber/90' : 'bg-navy text-white hover:bg-navy/80'}`}>
                  {price === 0 ? 'Start Free' : 'Get Started'}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="font-montserrat font-bold text-2xl text-navy text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map(([q, a], i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left font-semibold text-navy text-sm hover:bg-light-grey transition-colors">
                  {q}
                  <span className="text-amber ml-4 shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-steel-grey text-sm leading-relaxed">{a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
