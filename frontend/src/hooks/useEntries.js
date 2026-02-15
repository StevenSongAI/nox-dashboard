import { useState, useEffect, useCallback } from 'react'
import client from '../api/client.js'

export function useEntries(category = '', type = '', search = '', limit = 20) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
    offset: 0
  })

  const fetchEntries = useCallback(async (offset = 0) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (type) params.append('type', type)
      if (search) params.append('search', search)
      params.append('limit', limit)
      params.append('offset', offset)

      const response = await client.get(`/entries?${params}`)
      
      if (offset === 0) {
        setEntries(response.data.entries)
      } else {
        // Deduplicate entries when loading more - prevent duplicates (DEFECT-004)
        setEntries(prev => {
          const existingIds = new Set(prev.map(e => e.id))
          const newEntries = response.data.entries.filter(e => !existingIds.has(e.id))
          return [...prev, ...newEntries]
        })
      }

      setPagination({
        total: response.data.pagination?.total || 0,
        hasMore: response.data.pagination?.hasMore || false,
        offset: offset + response.data.entries.length
      })
    } catch (err) {
      setError(err.message || 'Failed to fetch entries')
    } finally {
      setLoading(false)
    }
  }, [category, type, search, limit])

  useEffect(() => {
    fetchEntries(0)
  }, [fetchEntries])

  const loadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchEntries(pagination.offset)
    }
  }

  return { entries, loading, error, pagination, loadMore, refetch: () => fetchEntries(0) }
}

export function useEntry(id) {
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const fetchEntry = async () => {
      try {
        const response = await client.get(`/entries/${id}`)
        setEntry(response.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch entry')
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [id])

  return { entry, loading, error }
}

export function useStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/stats')
        setStats(response.data)
      } catch (err) {
        setError(err.message || 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
