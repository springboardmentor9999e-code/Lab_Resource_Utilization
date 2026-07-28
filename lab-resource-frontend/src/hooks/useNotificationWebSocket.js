import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function useNotificationWebSocket() {
  const queryClient = useQueryClient();
  const { user, token } = useAuth();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (!user || !token) return;

    try {
      const wsUrl = `http://localhost:8081/ws?token=${token}`;
      const eventSource = new EventSource(wsUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          queryClient.invalidateQueries(['notifications']);
          queryClient.invalidateQueries(['notification-unread-count']);
          toast(data.title || 'New notification', {
            icon: '🔔',
            duration: 5000,
          });
        } catch (e) {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      wsRef.current = eventSource;
    } catch (e) {
      // WebSocket connection not available, relying on polling fallback
    }
  }, [user, token, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
}
