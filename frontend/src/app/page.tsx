'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    api.get('/health')
        .then(() => setStatus('online'))
        .catch(() => setStatus('offline'));
  }, []);

  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center dark:bg-zinc-950">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter text-black dark:text-white">
            Enterprise <span className="text-primary">Chat</span>
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Real-time messaging powered by Socket.io & Next.js
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <span className={`h-3 w-3 rounded-full ${
                status === 'online' ? 'bg-green-500 animate-pulse' :
                    status === 'offline' ? 'bg-red-500' : 'bg-zinc-300'
            }`} />
            <span className="text-sm font-medium uppercase tracking-widest text-zinc-400">
              Backend: {status}
            </span>
          </div>

          <div className="flex gap-4 pt-8">
            {user ? (
                <Link href="/chat">
                  <Button className="px-12 py-6 text-lg">Open Dashboard</Button>
                </Link>
            ) : (
                <>
                  <Link href="/login">
                    <Button className="px-8 py-3">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" className="px-8 py-3">Register</Button>
                  </Link>
                </>
            )}
          </div>
        </div>
      </div>
  );
}