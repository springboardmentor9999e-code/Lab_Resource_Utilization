import { useState, useCallback } from "react";
import api from "../services/api";

export default function useAxios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(config);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "An error occurred";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { api, loading, error, request };
}
