import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { UserProfile, SubscriptionTier } from '@/types'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref = doc(db, COLLECTIONS.USERS, u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile)
        } else {
          // Create profile on first sign-in
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email ?? '',
            displayName: u.displayName ?? '',
            subscription: 'free',
          }
          await setDoc(ref, newProfile)
          setProfile(newProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email ?? '')
  const isPremium = profile?.subscription === 'member' || isAdmin

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function register(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const ref = doc(db, COLLECTIONS.USERS, cred.user.uid)
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email,
      displayName,
      subscription: 'free',
    }
    await setDoc(ref, newProfile)
    setProfile(newProfile)
    return cred
  }

  async function logout() {
    await signOut(auth)
  }

  async function upgradeSubscription(tier: SubscriptionTier, expiryDate: string) {
    if (!user) return
    const ref = doc(db, COLLECTIONS.USERS, user.uid)
    const update = { subscription: tier, subscribedAt: new Date().toISOString(), subscriptionExpiry: expiryDate }
    await setDoc(ref, update, { merge: true })
    setProfile(prev => prev ? { ...prev, ...update } : null)
  }

  return { user, profile, loading, isAdmin, isPremium, login, register, logout, upgradeSubscription }
}
