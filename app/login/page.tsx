'use client';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 420,
          width: '100%',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>🖥️</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>
          V.Two Hardware Inventory
        </h1>
        <p style={{ color: '#888aa0', fontSize: '0.9rem', marginBottom: 32 }}>
          Sign in with your V.Two Microsoft account to report the company hardware
          you have.
        </p>
        <button
          onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          Sign in with Microsoft
        </button>
        <p style={{ color: '#555577', fontSize: '0.75rem', marginTop: 24 }}>
          Access restricted to @vtwo.co accounts
        </p>
      </div>
    </div>
  );
}
