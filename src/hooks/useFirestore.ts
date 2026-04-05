import { useState, useEffect } from 'react'
import { fetchCollection, where } from '@/lib/firebase'
import type { Article, Opportunity, Product, Programme, ToolboxItem } from '@/types'

// Client-side sort by createdAt descending (avoids composite index requirement)
function byCreatedAtDesc<T extends { createdAt?: string }>(a: T, b: T): number {
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
}

export function useArticles(publishedOnly = true) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Use only a single where() constraint — no compound query, no index needed
    const constraints = publishedOnly ? [where('published', '==', true)] : []
    fetchCollection<Article>('articles', constraints)
      .then(data => setArticles([...data].sort(byCreatedAtDesc)))
      .catch(err => {
        console.error('articles fetch error:', err)
        setError('Could not load articles.')
        setArticles([])
      })
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { articles, loading, error }
}

export function useOpportunities(publishedOnly = true) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const constraints = publishedOnly ? [where('published', '==', true)] : []
    fetchCollection<Opportunity>('opportunities', constraints)
      .then(data => setOpportunities([...data].sort(byCreatedAtDesc)))
      .catch(err => {
        console.error('opportunities fetch error:', err)
        setError('Could not load opportunities.')
        setOpportunities([])
      })
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { opportunities, loading, error }
}

export function useProducts(publishedOnly = true) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const constraints = publishedOnly ? [where('published', '==', true)] : []
    fetchCollection<Product>('products', constraints)
      .then(data => setProducts([...data].sort(byCreatedAtDesc)))
      .catch(err => {
        console.error('products fetch error:', err)
        setError('Could not load products.')
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { products, loading, error }
}

export function useProgrammes(publishedOnly = true) {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const constraints = publishedOnly ? [where('published', '==', true)] : []
    fetchCollection<Programme>('programmes', constraints)
      .then(data => setProgrammes([...data].sort(byCreatedAtDesc)))
      .catch(err => {
        console.error('programmes fetch error:', err)
        setError('Could not load programmes.')
        setProgrammes([])
      })
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { programmes, loading, error }
}

export function useToolbox(publishedOnly = true) {
  const [items, setItems] = useState<ToolboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const constraints = publishedOnly ? [where('published', '==', true)] : []
    fetchCollection<ToolboxItem>('toolbox', constraints)
      .then(data => setItems([...data].sort(byCreatedAtDesc)))
      .catch(err => {
        console.error('toolbox fetch error:', err)
        setError('Could not load toolbox items.')
        setItems([])
      })
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { items, loading, error }
}
