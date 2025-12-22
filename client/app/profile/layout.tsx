// app/profile/layout.tsx
'use client';

import { AuthProvider } from '@/app/context/AuthContext';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaArrowLeft, FaUser, FaSignOutAlt } from 'react-icons/fa';

// ProfileNavbar component (moved inside layout to avoid separate file)
function ProfileNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdminPage = pathname.includes('/profile/admin');

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft /> Back to Home
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isAdminPage ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <FaUser className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium">{user?.username || 'Guest'}</div>
                <div className="text-xs text-gray-500">
                  {isAdminPage ? 'Administrator Dashboard' : 'My Account'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={isAdminPage ? '/profile/admin' : '/profile/user'}
              className={`px-4 py-2 rounded-lg font-medium ${
                isAdminPage 
                  ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {isAdminPage ? 'Admin Panel' : 'My Profile'}
            </Link>
            
            {user?.role === 'admin' && !isAdminPage && (
              <Link
                href="/profile/admin"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Switch to Admin
              </Link>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <ProfileNavbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}