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
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyCenter: 'center', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', backgroundColor: '#1a1a20', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Community Chat</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>Opening community chat room...</p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/user/community';
                } else {
                  reset();
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#CD7F32',
                color: 'white',
                border: 'none',
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
      </body>
    </html>
  );
}
