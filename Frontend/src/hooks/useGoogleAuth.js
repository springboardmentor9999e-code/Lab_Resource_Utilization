import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom React Hook for Google Identity Services (GIS) OAuth 2.0.
 * Guarantees google.accounts.id.initialize() is called EXACTLY ONCE globally
 * to eliminate GSI_LOGGER warnings and optimize performance on low-spec hardware.
 */
export function useGoogleAuth({ clientId, onSuccess, onError }) {
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const initGoogleAuth = useCallback(() => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      return;
    }

    // Single initialization guard across the entire app session
    if (!window.__gsiInitialized) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response && response.credential) {
              onSuccessRef.current?.(response.credential);
            } else {
              onErrorRef.current?.('No credential returned');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.__gsiInitialized = true;
      } catch (err) {
        console.warn('GSI Init Warning:', err);
      }
    }

    // Render the Google Sign-In button into the target container if available
    if (buttonContainerRef.current) {
      try {
        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          type: 'standard',
          text: 'continue_with',
          width: 320
        });
      } catch (_) {}
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;

    // Check if script is already present in DOM
    const existingScript = document.getElementById('google-gsi-script');

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initGoogleAuth();
    } else if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleAuth();
      };
      script.onerror = () => {
        onErrorRef.current?.('Failed to load Google SDK');
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', initGoogleAuth);
      return () => {
        existingScript.removeEventListener('load', initGoogleAuth);
      };
    }
  }, [clientId, initGoogleAuth]);

  return { buttonContainerRef };
}
