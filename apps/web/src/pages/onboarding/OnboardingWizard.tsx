import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ChevronRight, ChevronLeft, Info, Save } from 'lucide-react';

const INDUSTRIES = [
  'Agriculture Technology','Education Technology','Health Technology','Financial Services','Retail & E-Commerce',
  'Food & Beverage','Manufacturing','Construction & Real Estate','Transport & Logistics','Tourism & Hospitality',
  'Media & Entertainment','Professional Services','Energy & Utilities','Telecommunications','Non-Profit / NGO',
  'Fashion & Apparel','Beauty & Personal Care','Sports & Fitness','Legal Services','Automotive',
];

interface FormData {
  businessName: string; tagline: string; industry: string; industryTemplate: string;
  stage: string; country: string; currency: string; legalStructure: string;
  missionStatement: string; problemSolved: string; targetCustomer: string;
  revenueModel: string; teamSize: string; fundingAmountNeeded: string;
  fundingPurpose: string; fundingType: string; location: string; website: string;
  founderName: string; founderRole: string; founderBackground: string;
  productName: string; productDescription: string; productPrice: string; productUnit: string;
}

const INITIAL: FormData = {
  businessName: '', tagline: '', industry: '', industryTemplate: '', stage: 'IDEA',
  country: 'UG', currency: 'USD', legalStructure: '', missionStatement: '',
  problemSolved: '', targetCustomer: '', revenueModel: '', teamSize: '1',
  fundingAmountNeeded: '', fundingPurpose: '', fundingType: 'EQUITY', location: '',
  website: '', founderName: '', founderRole: 'CEO', founderBackground: '',
  productName: '', productDescription: '', productPrice: '', productUnit: 'month',
};

const STEPS = ['Business Basics', 'Industry & Market', 'Products & Revenue', 'Team & Founders', 'Funding Needs'];

function Tooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <Info size={14} className="text-steel-grey cursor-help" />
      <div className="hidden group-hover:block absolute left-0 top-5 z-10 bg-navy text-white text-xs p-2 rounded-lg w-48 leading-relaxed">{text}</div>
    </div>
  );
}

export default function OnboardingWizard() {
  const { profileId } = useParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const { setProfile } = useWorkspaceStore();
  const navigate = useNavigate();
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (profileId) {
      api.get(`/profiles/${profileId}`).then(({ data }) => {
        const d = data.onboardingData as Partial<FormData>;
        setForm(f => ({ ...f, ...d, businessName: data.name, industry: data.industry, industryTemplate: data.industryTemplate, stage: data.stage, country: data.country, currency: data.currency }));
      });
    }
  }, [profileId]);

  const set = (k: keyof FormData, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    autosaveRef.current = setTimeout(() => doSave(), 60000);
  };

  const completeness = () => {
    const required = ['businessName', 'industry', 'problemSolved', 'targetCustomer', 'revenueModel', 'fundingAmountNeeded', 'fundingPurpose', 'location', 'founderName'];
    const filled = required.filter(k => form[k as keyof FormData]?.trim()).length;
    return Math.round((filled / required.length) * 100);
  };

  const buildPayload = () => ({
    businessName: form.businessName,
    tagline: form.tagline,
    industry: form.industry,
    industryTemplate: form.industryTemplate || form.industry.toLowerCase().replace(/\s+/g, '_'),
    stage: form.stage,
    country: form.country,
    currency: form.currency,
    legalStructure: form.legalStructure,
    missionStatement: form.missionStatement,
    problemSolved: form.problemSolved,
    targetCustomer: form.targetCustomer,
    productsServices: form.productName ? [{ name: form.productName, description: form.productDescription, price: parseFloat(form.productPrice) || 0, unit: form.productUnit }] : [],
    revenueModel: form.revenueModel,
    teamSize: parseInt(form.teamSize) || 1,
    founders: form.founderName ? [{ name: form.founderName, role: form.founderRole, background: form.founderBackground }] : [],
    fundingAmountNeeded: parseFloat(form.fundingAmountNeeded) || 0,
    fundingPurpose: form.fundingPurpose,
    fundingType: form.fundingType,
    location: form.location,
    website: form.website,
  });

  const doSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      if (profileId) {
        await api.put(`/profiles/${profileId}`, { name: form.businessName, onboardingData: payload, stage: form.stage as 'IDEA', country: form.country });
      } else {
        const { data } = await api.post('/profiles', {
          name: form.businessName || 'Untitled Business',
          industry: form.industry || 'General',
          industryTemplate: form.industryTemplate || 'general',
          stage: form.stage,
          country: form.country,
          currency: form.currency,
          onboardingData: payload,
        });
        setProfile(data);
        navigate(`/onboarding/${data.id}`, { replace: true });
      }
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    await doSave();
    navigate('/dashboard');
  };

  const inp = (label: string, key: keyof FormData, type = 'text', tooltip?: string, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-dark-grey mb-1">{label}{tooltip && <Tooltip text={tooltip} />}</label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" />
    </div>
  );

  const ta = (label: string, key: keyof FormData, tooltip?: string, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-dark-grey mb-1">{label}{tooltip && <Tooltip text={tooltip} />}</label>
      <textarea rows={rows} value={form[key]} onChange={e => set(key, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy resize-none" />
    </div>
  );

  const sel = (label: string, key: keyof FormData, options: string[][], tooltip?: string) => (
    <div>
      <label className="block text-sm font-medium text-dark-grey mb-1">{label}{tooltip && <Tooltip text={tooltip} />}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  const stepContent = [
    <div className="space-y-4" key={0}>
      {inp('Business Name', 'businessName', 'text', 'The legal or trading name of your business', 'e.g. AgriTech Uganda Ltd')}
      {inp('Tagline (optional)', 'tagline', 'text', undefined, 'e.g. Connecting farmers to markets')}
      {ta('Mission Statement (optional)', 'missionStatement', 'Your purpose beyond profit — why does this business exist?')}
      {sel('Business Stage', 'stage', [['IDEA','Idea — not yet operating'],['PRE_REVENUE','Pre-Revenue — building product'],['EARLY','Early — some customers/revenue'],['GROWTH','Growth — scaling rapidly'],['SCALE','Scale — established & expanding']], 'The current stage of your business')}
      {inp('Location (City, Country)', 'location', 'text', undefined, 'e.g. Kampala, Uganda')}
      {sel('Country', 'country', [['UG','Uganda'],['KE','Kenya'],['TZ','Tanzania'],['RW','Rwanda'],['NG','Nigeria'],['GH','Ghana'],['ZA','South Africa'],['US','United States'],['GB','United Kingdom'],['OTHER','Other']])}
      {inp('Website (optional)', 'website', 'url', undefined, 'https://yourbusiness.com')}
    </div>,

    <div className="space-y-4" key={1}>
      <div>
        <label className="block text-sm font-medium text-dark-grey mb-1">Industry <Tooltip text="Select the primary industry your business operates in" /></label>
        <select value={form.industry} onChange={e => set('industry', e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy">
          <option value="">Select an industry…</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      {ta('Problem Solved', 'problemSolved', 'What specific problem does your business solve? Be concrete.', 4)}
      {ta('Target Customer', 'targetCustomer', 'Who exactly are your customers? Age, location, income level, behaviour.', 3)}
      {sel('Currency', 'currency', [['USD','USD ($)'],['UGX','UGX (UGX)'],['KES','KES (Ksh)'],['NGN','NGN (₦)'],['ZAR','ZAR (R)'],['EUR','EUR (€)'],['GBP','GBP (£)']])}
    </div>,

    <div className="space-y-4" key={2}>
      {inp('Product / Service Name', 'productName', 'text', 'Your primary product or service', 'e.g. Mobile App Subscription')}
      {ta('Product Description', 'productDescription', 'What does it do and what value does it deliver?')}
      <div className="grid grid-cols-2 gap-4">
        {inp('Price', 'productPrice', 'number', 'Price per unit in your chosen currency')}
        {sel('Price Unit', 'productUnit', [['month','/month'],['year','/year'],['unit','/unit'],['transaction','/transaction'],['kg','/kg'],['litre','/litre']])}
      </div>
      {ta('Revenue Model', 'revenueModel', 'How exactly does the business make money? SaaS, marketplace, retail, etc.', 3)}
    </div>,

    <div className="space-y-4" key={3}>
      {inp('Lead Founder Name', 'founderName', 'text')}
      {sel('Founder Role', 'founderRole', [['CEO','CEO'],['Co-Founder','Co-Founder'],['MD','Managing Director'],['CTO','CTO'],['COO','COO']])}
      {ta('Founder Background', 'founderBackground', 'Relevant experience, qualifications, and why this person can execute this business', 4)}
      {inp('Total Team Size', 'teamSize', 'number', 'Including founders, full-time, and part-time staff')}
      {sel('Legal Structure', 'legalStructure', [['','Not yet incorporated'],['sole_trader','Sole Trader'],['partnership','Partnership'],['limited','Limited Company'],['co_operative','Co-operative'],['ngo','NGO / Non-Profit']])}
    </div>,

    <div className="space-y-4" key={4}>
      {inp('Funding Amount Needed (USD)', 'fundingAmountNeeded', 'number', 'How much capital are you seeking?')}
      {ta('Funding Purpose', 'fundingPurpose', 'Exactly what will you spend this funding on? Be specific.', 4)}
      {sel('Funding Type', 'fundingType', [['EQUITY','Equity — give shares to investors'],['LOAN','Loan — borrow and repay'],['GRANT','Grant — no repayment required'],['MIXED','Mixed — combination']])}
    </div>,
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-montserrat font-bold text-2xl text-navy">Business Profile Setup</h1>
        <div className="flex items-center gap-2 text-xs text-steel-grey">
          {saving ? <><div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin" /> Saving…</> : savedAt ? <><Save size={12} className="text-success" /> Saved</> : null}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-xs text-steel-grey mb-2">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className={`font-medium transition-colors ${i === step ? 'text-navy' : i < step ? 'text-success' : 'text-steel-grey'}`}>
              {i < step ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-amber rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-steel-grey">Step {step + 1} of {STEPS.length}</span>
          <span className="text-xs font-medium text-navy">Profile {completeness()}% complete</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="font-montserrat font-bold text-navy text-xl mb-6">{STEPS[step]}</h2>
        {stepContent[step]}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-steel-grey hover:text-navy disabled:opacity-30 transition-colors">
          <ChevronLeft size={18} /> Back
        </button>
        <div className="flex gap-3">
          <button onClick={doSave} disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-navy border border-navy rounded-lg hover:bg-navy/5 disabled:opacity-50">
            Save Draft
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-navy/90">
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving} className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-amber/90 disabled:opacity-50">
              Finish Setup <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
