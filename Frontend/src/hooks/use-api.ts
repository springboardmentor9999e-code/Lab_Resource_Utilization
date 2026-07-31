import { useCallback, useEffect, useState } from "react";
import { apiErrorMessage } from "@/services/api";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: (d: T | null) => void;
}

/** Fetch on mount, expose reload/setData. `fn` must be stable (wrap in useCallback if defined inline). */
export function useApi<T>(fn: () => Promise<T>, deps: React.DependencyList = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(apiErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, reload: run, setData };
}
