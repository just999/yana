// src/app/debug-env/page.tsx (for app router)
// or pages/debug-env.tsx (for pages router)

export default function DebugEnv() {
  return (
    <div className='p-8'>
      <h1 className='mb-4 text-2xl font-bold'>Environment Debug</h1>
      <div className='space-y-2'>
        <p>
          <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
        </p>
        <p>
          <strong>DATABASE_URL exists:</strong>{' '}
          {process.env.DATABASE_URL ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>DATABASE_URL preview:</strong>{' '}
          {process.env.DATABASE_URL?.substring(0, 50)}...
        </p>
      </div>
      <div className='mt-4'>
        <button
          onClick={() =>
            fetch('/api/test-db')
              .then((res) => res.json())
              .then(console.log)
          }
          className='rounded bg-blue-500 px-4 py-2 text-white'
        >
          Test Database Connection
        </button>
      </div>
    </div>
  );
}
