// components/ProfileNavbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function ProfileNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.includes('/profile/admin');

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            Back to Home
          </Link>
          {/* Add more navbar content as needed */}
        </div>
      </div>
    </nav>
  );
}