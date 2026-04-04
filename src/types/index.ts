export type SubscriptionTier = 'free' | 'member'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  subscription: SubscriptionTier
  subscribedAt?: string
  subscriptionExpiry?: string
}

export interface Article {
  id: string
  title: string
  excerpt: string
  body: string
  author: string
  category: string
  featured: boolean
  published: boolean
  imageUrl?: string
  createdAt: string
}

export interface Opportunity {
  id: string
  title: string
  organisation: string
  description: string
  category: 'grant' | 'scholarship' | 'exhibition' | 'competition'
  deadline: string
  link: string
  featured: boolean
  published: boolean
  imageUrl?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number // UGX
  category: string
  imageUrl?: string
  inStock: boolean
  published: boolean
  impact?: string // e.g. "Supports youth trainees"
  createdAt: string
}

export interface Programme {
  id: string
  title: string
  description: string
  duration: string
  price: number // UGX; 0 = free
  category: 'individual' | 'group' | 'corporate'
  topics: string[]
  published: boolean
  imageUrl?: string
  createdAt: string
}

export interface ToolboxItem {
  id: string
  title: string
  description: string
  type: 'template' | 'guide' | 'tool' | 'checklist'
  fileUrl?: string
  previewUrl?: string
  price: number // 0 = free
  published: boolean
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  items: CartItem[]
  totalUGX: number
  status: 'pending' | 'paid' | 'failed'
  pesapalOrderId?: string
  pesapalTrackingId?: string
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  imageUrl?: string
}

export interface SuccessStory {
  id: string
  name: string
  business: string
  quote: string
  imageUrl?: string
}
