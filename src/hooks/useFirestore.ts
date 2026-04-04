import { useState, useEffect } from 'react'
import { fetchCollection, where, orderBy } from '@/lib/firebase'
import type { Article, Opportunity, Product, Programme, ToolboxItem } from '@/types'

export function useArticles(publishedOnly = true) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints = publishedOnly
      ? [where('published', '==', true), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')]
    fetchCollection<Article>('articles', constraints)
      .then(setArticles)
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { articles, loading }
}

export function useOpportunities(publishedOnly = true) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints = publishedOnly
      ? [where('published', '==', true), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')]
    fetchCollection<Opportunity>('opportunities', constraints)
      .then(setOpportunities)
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { opportunities, loading }
}

export function useProducts(publishedOnly = true) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints = publishedOnly
      ? [where('published', '==', true), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')]
    fetchCollection<Product>('products', constraints)
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { products, loading }
}

export function useProgrammes(publishedOnly = true) {
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints = publishedOnly
      ? [where('published', '==', true), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')]
    fetchCollection<Programme>('programmes', constraints)
      .then(setProgrammes)
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { programmes, loading }
}

export function useToolbox(publishedOnly = true) {
  const [items, setItems] = useState<ToolboxItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints = publishedOnly
      ? [where('published', '==', true), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')]
    fetchCollection<ToolboxItem>('toolbox', constraints)
      .then(setItems)
      .finally(() => setLoading(false))
  }, [publishedOnly])

  return { items, loading }
}
