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
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '48rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
              Global Application Error
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Error Details:</h3>
              <pre style={{
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {error.message}
              </pre>
            </div>

            {error.stack && (
              <details style={{ marginBottom: '1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Stack Trace (Click to expand)
                </summary>
                <pre style={{
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  maxHeight: '20rem',
                  overflowY: 'auto'
                }}>
                  {error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={reset}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer',
                marginRight: '0.5rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}