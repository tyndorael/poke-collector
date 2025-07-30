'use client';

import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center">
      <Image src="/pokeball.svg" alt="Pokeball" width={150} height={150} className="animate-bounce" />
      <h1 className="text-5xl font-extrabold text-pokemon-yellow mt-8 mb-4">Welcome to Poke-Collector</h1>
      <p className="text-xl text-gray-300">Manage you pokemon card collections!</p>
      <p className="text-lg text-gray-400 mt-2">Loading...</p>
    </div>
  );
}
