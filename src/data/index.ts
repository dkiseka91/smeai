// Seed data — used to populate Firestore via the Admin Panel
// Run: Admin Panel > Content Manager > "Seed Database"

import type { Article, Opportunity, Product, Programme, ToolboxItem, TeamMember, SuccessStory } from '@/types'

export const seedArticles: Omit<Article, 'id'>[] = [
  {
    title: 'How to Register a Business in Uganda in 2025',
    excerpt: 'A step-by-step guide to registering your business with URSB and obtaining the necessary permits.',
    body: 'Full article body goes here...',
    author: 'AElevate Team',
    category: 'Legal & Compliance',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Access to Finance: Micro-loan Options for Ugandan SMEs',
    excerpt: 'Explore the best micro-loan programmes available to small businesses in Uganda.',
    body: 'Full article body goes here...',
    author: 'AElevate Team',
    category: 'Finance',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
  },
]

export const seedOpportunities: Omit<Opportunity, 'id'>[] = [
  {
    title: 'Youth Entrepreneurship Fund — 2025',
    organisation: 'Enterprise Uganda',
    description: 'Grants of up to UGX 20M for youth-led businesses in manufacturing and agribusiness.',
    category: 'grant',
    deadline: '2025-09-30',
    link: '#',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'NSSF Hi-Innovator Programme',
    organisation: 'NSSF Uganda',
    description: 'Annual innovation competition with seed funding and mentorship for Ugandan entrepreneurs.',
    category: 'competition',
    deadline: '2025-08-15',
    link: '#',
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
  },
]

export const seedProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Handwoven Basket — Large',
    description: 'Beautifully handwoven by Ugandan artisans from natural materials.',
    price: 45000,
    category: 'Crafts',
    inStock: true,
    published: true,
    impact: 'Supports youth artisans in Kampala',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Shea Butter Gift Set',
    description: 'Pure, cold-pressed shea butter products from Northern Uganda cooperatives.',
    price: 75000,
    category: 'Beauty',
    inStock: true,
    published: true,
    impact: 'Supports women-led cooperatives in Gulu',
    createdAt: new Date().toISOString(),
  },
]

export const seedProgrammes: Omit<Programme, 'id'>[] = [
  {
    title: 'Business Fundamentals Bootcamp',
    description: 'A 4-week intensive covering business planning, finance, marketing, and legal basics.',
    duration: '4 weeks',
    price: 350000,
    category: 'individual',
    topics: ['Business Planning', 'Financial Management', 'Marketing', 'Legal Compliance'],
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Corporate SME Training Package',
    description: 'Customised training delivered to your team on-site or online.',
    duration: 'Flexible',
    price: 0,
    category: 'corporate',
    topics: ['Leadership', 'Business Strategy', 'Financial Literacy', 'Digital Tools'],
    published: true,
    createdAt: new Date().toISOString(),
  },
]

export const seedToolbox: Omit<ToolboxItem, 'id'>[] = [
  {
    title: 'Business Plan Template (Uganda)',
    description: 'A locally-adapted business plan template with guidance notes for Ugandan SMEs.',
    type: 'template',
    price: 0,
    published: true,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Cash Flow Tracker — Excel',
    description: 'Simple monthly cash flow spreadsheet with automatic balance calculations.',
    type: 'tool',
    price: 15000,
    published: true,
    createdAt: new Date().toISOString(),
  },
]

export const seedTeam: Omit<TeamMember, 'id'>[] = [
  {
    name: 'AElevate Founder',
    role: 'Chief Executive Officer',
    bio: 'Passionate about empowering Ugandan entrepreneurs with the tools and knowledge to grow.',
  },
]

export const seedStories: Omit<SuccessStory, 'id'>[] = [
  {
    name: 'Sarah M.',
    business: 'Kampala Fashion House',
    quote: 'AElevate helped me structure my business and access funding I never knew existed.',
  },
]
