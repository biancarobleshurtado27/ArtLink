import { useEffect, useState } from 'react'
import { getCategories } from '../services/categoryService'

export default function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getCategories()
      .then((data) => { if (active) setCategories(data) })
      .catch((requestError) => { if (active) setError(requestError) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { categories, loading, error }
}
