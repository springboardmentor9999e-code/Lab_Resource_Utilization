// Live utilization feed over the browser's native WebSocket — the backend socket is plain text
// and one-way, so no STOMP/SockJS client is needed.
//
// Events say only that something changed, so subscribers refetch. debounceMs coalesces bursts
// (approving a batch of bookings, cancelling a recurring series) into a single refetch.

const SOCKET_PATH = '/ws/utilization';

// Capped backoff: reconnect quickly after a restart, but never hot-loop against a refusing server.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

/** Derives the ws:// URL from the configured API base, falling back to the current origin. */
const socketUrl = (token) => {
  // Same default as services/api.js — keep the two in step
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  let origin;
  try {
    // May be absolute ("http://host:8080/api") or a relative proxy path ("/api")
    origin = apiBase.startsWith('http') ? new URL(apiBase).origin : window.location.origin;
  } catch {
    origin = window.location.origin;
  }
  const wsOrigin = origin.replace(/^http/, 'ws');
  return `${wsOrigin}${SOCKET_PATH}?token=${encodeURIComponent(token)}`;
};

/**
 * Opens the live feed.
 *
 * @param {string} token     JWT — the handshake is rejected without a valid one
 * @param {Function} onChange called (debounced) when utilization data has changed
 * @param {number} debounceMs how long to coalesce a burst of events
 * @returns {Function} teardown; call it on unmount
 */
export const connectUtilizationFeed = (token, onChange, debounceMs = 1500) => {
  if (!token) {
    return () => {};
  }

  let socket = null;
  let reconnectTimer = null;
  let debounceTimer = null;
  let attempt = 0;
  let closedByCaller = false;

  const scheduleChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => onChange(), debounceMs);
  };

  const open = () => {
    if (closedByCaller) return;

    try {
      socket = new WebSocket(socketUrl(token));
    } catch {
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      attempt = 0; // a successful connection resets the backoff
    };

    socket.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.event === 'UTILIZATION_CHANGED') {
          scheduleChange();
        }
      } catch {
        // Ignore anything that is not the JSON we expect
      }
    };

    socket.onclose = () => {
      if (!closedByCaller) scheduleReconnect();
    };

    socket.onerror = () => {
      // onclose always follows, which is where the reconnect is handled
    };
  };

  const scheduleReconnect = () => {
    if (closedByCaller) return;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt);
    attempt += 1;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(open, delay);
  };

  open();

  return () => {
    closedByCaller = true;
    clearTimeout(reconnectTimer);
    clearTimeout(debounceTimer);
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
    }
  };
};

export default connectUtilizationFeed;
