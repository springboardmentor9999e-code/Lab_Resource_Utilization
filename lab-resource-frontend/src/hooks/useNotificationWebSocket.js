import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/api';

const SSE_URL = 'http://localhost:8081/api/notifications/stream';

export function useNotificationWebSocket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const esRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectingRef = useRef(false);

  const openStream = useCallback(async () => {
    if (!user || connectingRef.current) return;
    connectingRef.current = true;

    try {
      const res = await notificationApi.getSseTicket();
      const ticket = res.data.ticket;

      const eventSource = new EventSource(`${SSE_URL}?ticket=${ticket}`);

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
        esRef.current = null;
        connectingRef.current = false;
        reconnectTimeoutRef.current = setTimeout(() => openStream(), 5000);
      };

      esRef.current = eventSource;
      connectingRef.current = false;
    } catch (e) {
      connectingRef.current = false;
      reconnectTimeoutRef.current = setTimeout(() => openStream(), 15000);
    }
  }, [user, queryClient]);

  useEffect(() => {
    openStream();
    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [openStream]);
}
