import { useState, useCallback } from 'react'

export function useApi(apiFunc) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFunc(...args)
      const result = response.data
      setData(result)
      return result
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunc])

  return { data, loading, error, execute, setData }
}

export default useApi
