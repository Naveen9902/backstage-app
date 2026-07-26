'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: '#121215', color: 'white', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', backgroundColor: '#1a1a20', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#CD7F32' }}>Community Chat</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>Opening community chat room...</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
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
                ⚡ Reload Page
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/user/community';
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
                Back to Communities
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
