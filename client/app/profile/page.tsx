// app/profile/page.tsx - MAIN ENTRY POINT
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import LoadingSpinner from '@/components/Loading';

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/profile/admin');
      } else {
        router.push('/profile/user');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return null; // Will redirect automatically
}