import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, PresentationIcon, BookOpen, MessageCircle, Globe, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  { icon: FileText,         title: 'Business Plan Generator', desc: '10-section professional plan tailored to banks, investors, or grants — written in minutes.' },
  { icon: BarChart3,        title: '3-Year Financial Model',  desc: 'Revenue projections, P&L, cash flow, break-even analysis exported to Excel.' },
  { icon: PresentationIcon, title: 'Investor Pitch Deck',     desc: '8–12 slide deck with speaker notes, PPTX & PDF export, AI review scoring.' },
  { icon: BookOpen,         title: 'Loan Application Toolkit',desc: 'Cover letters and supporting documents calibrated for East African banks and DFIs.' },
  { icon: MessageCircle,    title: 'AI Business Advisor',     desc: 'Chat with an AI that knows your business inside-out — 24/7, context-aware.' },
  { icon: Globe,            title: 'Global Templates',        desc: '75+ industry templates pre-loaded with market context for 50+ countries.' },
];

const steps = [
  { n: '01', title: 'Answer simple questions',   desc: 'Our wizard asks plain-language questions about your business — no jargon, no MBA required.' },
  { n: '02', title: 'AI builds your documents',  desc: 'Claude AI generates your plan, financial model, and pitch deck simultaneously in under an hour.' },
  { n: '03', title: 'Review and refine',          desc: 'Edit any section, regenerate individual parts, and get an AI review score on your pitch deck.' },
  { n: '04', title: 'Download and present',       desc: 'Export polished DOCX, PDF, PPTX, and XLSX files ready for investors, banks, or grant committees.' },
];

const plans = [
  { name: 'Free',         price: 0,   tag: 'Try it out',        features: ['1 business plan/month','1 pitch deck/month','10 AI advisor queries','Watermarked exports'] },
  { name: 'Entrepreneur', price: 19,  tag: 'Solo founder',      features: ['Unlimited plans & decks','Unlimited AI advisor','Clean exports (no watermark)','1 workspace seat'] },
  { name: 'Growth',       price: 49,  tag: 'Growing team',      features: ['Everything in Entrepreneur','3 workspace seats','Priority AI generation','Financial model exports'] },
  { name: 'Consultant',   price: 99,  tag: 'Business advisors', features: ['Everything in Growth','10 workspace seats','Client workspaces','White-label exports'] },
  { name: 'Institution',  price: 299, tag: 'Banks & incubators',features: ['Everything in Consultant','50 workspace seats','API access','Dedicated support'] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-opensans">
      <nav className="bg-navy px-6 py-4 flex justify-between items-center">
        <div>
          <span className="font-montserrat font-bold text-white text-xl">AElevate</span>
          <span className="text-amber text-xs font-semibold ml-2 tracking-widest">FUELING GROWTH</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium">Sign in</Link>
          <Link to="/register" className="bg-amber text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber/90 transition-colors">Get Started Free</Link>
        </div>
      </nav>

      <section className="bg-navy text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Turn Your Business Idea Into a<br />
            <span className="text-amber">Fundable Plan</span> — in Under an Hour
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            AI-powered business plans, financial models, and pitch decks calibrated for East African and emerging market entrepreneurs. No MBA required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-amber text-navy px-8 py-4 rounded-lg font-montserrat font-bold text-lg hover:bg-amber/90 transition-colors flex items-center justify-center gap-2">
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link to="/pricing" className="border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:border-white/60 transition-colors">
              View Pricing
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-6">No credit card required · 1 free business plan included</p>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat font-bold text-3xl text-navy text-center mb-4">Everything You Need to Get Funded</h2>
          <p className="text-steel-grey text-center mb-12 max-w-2xl mx-auto">Six powerful tools in one platform — built specifically for entrepreneurs in Africa and emerging markets.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-100 hover:border-amber/40 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-navy" />
                </div>
                <h3 className="font-montserrat font-bold text-navy text-lg mb-2">{title}</h3>
                <p className="text-steel-grey text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-light-grey">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-montserrat font-bold text-3xl text-navy text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative text-center">
                {i < steps.length - 1 && <div className="hidden md:block absolute top-8 left-3/4 w-full h-0.5 bg-amber/30" />}
                <div className="w-16 h-16 rounded-full bg-amber text-navy font-montserrat font-bold text-xl flex items-center justify-center mx-auto mb-4">{n}</div>
                <h3 className="font-montserrat font-bold text-navy mb-2">{title}</h3>
                <p className="text-steel-grey text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-montserrat font-bold text-3xl text-navy text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-steel-grey text-center mb-12">Start free, upgrade when you're ready.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {plans.map(plan => (
              <div key={plan.name} className={`rounded-xl p-6 border-2 flex flex-col ${plan.name === 'Growth' ? 'border-amber shadow-xl' : 'border-gray-100'}`}>
                {plan.name === 'Growth' && <div className="text-center mb-3"><span className="bg-amber text-navy text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span></div>}
                <h3 className="font-montserrat font-bold text-navy text-lg">{plan.name}</h3>
                <p className="text-steel-grey text-xs mb-3">{plan.tag}</p>
                <div className="mb-4">
                  <span className="text-3xl font-montserrat font-bold text-navy">${plan.price}</span>
                  {plan.price > 0 && <span className="text-steel-grey text-sm">/mo</span>}
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-dark-grey">
                      <CheckCircle size={14} className="text-success mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-6 block text-center py-2 rounded-lg text-sm font-bold transition-colors ${plan.name === 'Growth' ? 'bg-amber text-navy hover:bg-amber/90' : 'bg-navy text-white hover:bg-navy/80'}`}>
                  {plan.price === 0 ? 'Start Free' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-navy text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-montserrat font-bold text-xl">AElevate Business Innovations</p>
            <p className="text-amber text-sm font-semibold tracking-widest mt-1">FUELING GROWTH</p>
            <p className="text-white/50 text-sm mt-3">Kampala, Uganda · hello@aelevate.co.ug</p>
          </div>
          <div className="flex gap-12 text-sm text-white/60">
            <div className="space-y-2">
              <p className="text-white font-semibold">Product</p>
              <p><Link to="/pricing" className="hover:text-white">Pricing</Link></p>
              <p><Link to="/register" className="hover:text-white">Sign up</Link></p>
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold">Legal</p>
              <p><a href="#" className="hover:text-white">Privacy Policy</a></p>
              <p><a href="#" className="hover:text-white">Terms of Service</a></p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-8 pt-6 text-center text-white/40 text-xs">
          © 2026 AElevate Business Innovations. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
