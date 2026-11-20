import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCinemas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCinemas();
      setCinemas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  return { cinemas, loading, error, refetch: fetchCinemas };
}
