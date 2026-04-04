import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  throw new Error(
    `Firebase apiKey missing or invalid. Missing env vars: ${missingKeys.join(', ')}. ` +
    `Create a .env file — see .env.example for the required keys.`
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Collection refs
export const COLLECTIONS = {
  ARTICLES: 'articles',
  OPPORTUNITIES: 'opportunities',
  PRODUCTS: 'products',
  PROGRAMMES: 'programmes',
  TOOLBOX: 'toolbox',
  ORDERS: 'orders',
  USERS: 'users',
  TEAM: 'team',
  STORIES: 'stories',
} as const

// Generic CRUD helpers
export async function fetchCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref = collection(db, collectionName)
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T))
}

export async function fetchDoc<T>(collectionName: string, id: string): Promise<T | null> {
  const ref = doc(db, collectionName, id)
  const snap = await getDoc(ref)
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function createDoc(collectionName: string, data: object) {
  return addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() })
}

export async function upsertDoc(collectionName: string, id: string, data: object) {
  return setDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

export async function updateDocById(collectionName: string, id: string, data: object) {
  return updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteDocById(collectionName: string, id: string) {
  return deleteDoc(doc(db, collectionName, id))
}

export { where, orderBy }
