'use client';
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ backgroundColor: '#121215', color: 'white', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', backgroundColor: '#1a1a20', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ef4444' }}>App Error</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>An unexpected error occurred.</p>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left', overflow: 'auto', maxHeight: '200px' }}>
              <p style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{error.message}</p>
              {error.stack && (
                <pre style={{ color: '#d1d5db', fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {error.stack}
                </pre>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    if ('caches' in window) {
                      caches.keys().then(names => names.forEach(n => caches.delete(n))).catch(() => {});
                    }
                    window.location.href = window.location.pathname + '?t=' + Date.now();
                  } else {
                    reset();
                  }
                }}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#CD7F32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                ⚡ Hard Reload
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/user';
                  }
                }}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#2b2b2b',
                  color: '#d1d5db',
                  border: '1px solid #3a3a3a',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
