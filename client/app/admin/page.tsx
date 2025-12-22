// app/profile/admin/page.tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FaUserShield, 
  FaChartLine, 
  FaUsers, 
  FaCog, 
  FaProductHunt,
  FaBell,
  FaShieldAlt,
  FaSync,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import AdminStatsCard from '@/components/AdminStatsCard';
import RecentActivity from '@/components/RecentActivity';

// Interface matching your backend response
interface DashboardStats {
  success: boolean;
  stats: {
    users: {
      total: number;
      admins: number;
      active: number;
      inactive: number;
    };
    products: {
      total: number;
      electroTounes: number;
      myTek: number;
      spaceNet: number;
      tunisiaNet: number;
    };
  };
  recentUsers: Array<{
    _id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

async function fetchDashboardStats(token: string): Promise<DashboardStats | null> {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const response = await fetch('http://localhost:5000/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('📈 Dashboard response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Dashboard error:', errorText);
      throw new Error(`Failed to fetch dashboard: ${response.status} - ${errorText}`);
    }
    
    const data: DashboardStats = await response.json();
    console.log('✅ Dashboard data received:', data);
    
    if (!data.success) {
      throw new Error('Dashboard request was not successful');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return null;
  }
}

// Format numbers with commas
function formatNumber(num: number): string {
  return num?.toLocaleString('en-US') || '0';
}

// Calculate percentage change (mock for now)
function calculateChange(current: number, previous: number = 0): string {
  if (previous === 0) return '+0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
}

export default function AdminProfilePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin stats
  const loadDashboardStats = async () => {
    if (!user) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || '';
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
      
      const data = await fetchDashboardStats(token);
      
      if (data && data.success) {
        setDashboardData(data);
      } else {
        setError('Unable to load dashboard data. Please check if you have admin privileges.');
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(`Failed to load admin dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setStatsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardStats();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, isAuthenticated, router]);

  const handleRefresh = () => {
    loadDashboardStats();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Prepare stats for display - using real data from backend
  const displayStats = [
    { 
      title: 'Total Users', 
      value: dashboardData ? formatNumber(dashboardData.stats.users.total) : '...', 
      change: dashboardData ? calculateChange(dashboardData.stats.users.total) : '+0%', 
      icon: <FaUsers />, 
      color: 'blue',
      isLoading: statsLoading && !dashboardData,
      subText: dashboardData ? `${formatNumber(dashboardData.stats.users.admins)} admins` : ''
    },
    { 
      title: 'Active Users', 
      value: dashboardData ? formatNumber(dashboardData.stats.users.active) : '...', 
      change: dashboardData ? calculateChange(dashboardData.stats.users.active) : '+0%', 
      icon: <FaUserCheck />, 
      color: 'green',
      isLoading: statsLoading && !dashboardData,
      subText: dashboardData ? `${formatNumber(dashboardData.stats.users.inactive)} inactive` : ''
    },
    { 
      title: 'Total Products', 
      value: dashboardData ? formatNumber(dashboardData.stats.products.total) : '...', 
      change: '+12%', // Mock change, you can calculate based on previous data
      icon: <FaProductHunt />, 
      color: 'purple',
      isLoading: statsLoading && !dashboardData,
      subText: dashboardData ? 'Across all sources' : ''
    },
    { 
      title: 'Monthly Revenue', 
      value: '$24,580', // You'll need to add this to your backend
      change: '+18%', 
      icon: <FaChartLine />, 
      color: 'yellow',
      isLoading: false,
      subText: 'Estimated based on sales'
    },
  ];

  const adminActions = [
    { title: 'User Management', description: 'Manage all user accounts and permissions', path: '/admin/users', icon: <FaUsers /> },
    { title: 'Product Management', description: 'Add, edit, or remove products', path: '/admin/products', icon: <FaProductHunt /> },
    { title: 'System Settings', description: 'Configure system preferences', path: '/admin/settings', icon: <FaCog /> },
    { title: 'Security Logs', description: 'View security and access logs', path: '/admin/security', icon: <FaShieldAlt /> },
  ];

  // Prepare recent users for display
  const recentUsers = dashboardData?.recentUsers || [];

  return (
    <div className="space-y-8">
      {/* Header with refresh button */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <MdAdminPanelSettings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-red-100">Welcome back, {user.username}!</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-sm text-red-100">Administrator</div>
              <div className="text-lg font-semibold">{user.email}</div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Debug Info - remove in production */}
      {dashboardData && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>📊 Live Data Loaded:</strong> {dashboardData.stats.users.total} users, {dashboardData.stats.products.total} products</div>
            <div className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <AdminStatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserShield /> Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminActions.map((action, index) => (
                <a
                  key={index}
                  href={action.path}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-red-600">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUsers /> Recent Users
            </h2>
            {recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentUsers.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-medium text-sm">
                                {userItem.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {userItem.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {userItem.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            userItem.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                            userItem.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              userItem.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            {userItem.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent users found
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <a 
                href="/admin/users" 
                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center justify-center gap-1"
              >
                View All Users
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Distribution */}
          {dashboardData && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Product Distribution</h2>
              <div className="space-y-4">
                {[
                  { name: 'ElectroTounes', count: dashboardData.stats.products.electroTounes, color: 'bg-blue-500' },
                  { name: 'MyTek', count: dashboardData.stats.products.myTek, color: 'bg-green-500' },
                  { name: 'SpaceNet', count: dashboardData.stats.products.spaceNet, color: 'bg-purple-500' },
                  { name: 'TunisiaNet', count: dashboardData.stats.products.tunisiaNet, color: 'bg-yellow-500' },
                ].map((source) => (
                  <div key={source.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{source.name}</span>
                      <span className="text-gray-600">{formatNumber(source.count)} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${source.color}`}
                        style={{ 
                          width: `${(source.count / dashboardData.stats.products.total) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Admin Profile */}
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{user.username}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                    Administrator
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <div className="font-medium flex items-center gap-2">
                    <FaUserShield className="text-red-500" />
                    {user.role.toUpperCase()}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Account Created</label>
                  <div className="font-medium">
                    {new Date(user.createdAt || '').toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Login</label>
                  <div className="font-medium">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Edit Profile
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
            <div className="space-y-3">
              {[
                { 
                  label: 'Database Connection', 
                  status: dashboardData ? 'Connected' : 'Disconnected', 
                  color: dashboardData ? 'green' : 'red',
                  icon: '📊'
                },
                { 
                  label: 'API Server', 
                  status: 'Online', 
                  color: 'green',
                  icon: '⚡'
                },
                { 
                  label: 'Authentication', 
                  status: 'Active', 
                  color: 'green',
                  icon: '🔒'
                },
                { 
                  label: 'Last Data Sync', 
                  status: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
                  color: 'blue',
                  icon: '🔄'
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    item.color === 'green' ? 'bg-green-100 text-green-800' :
                    item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          {dashboardData && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs text-blue-600">Admins</div>
                  <div className="text-lg font-bold">{formatNumber(dashboardData.stats.users.admins)}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs text-green-600">Active Users</div>
                  <div className="text-lg font-bold">{formatNumber(dashboardData.stats.users.active)}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs text-purple-600">Inactive Users</div>
                  <div className="text-lg font-bold">{formatNumber(dashboardData.stats.users.inactive)}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-xs text-yellow-600">Total Products</div>
                  <div className="text-lg font-bold">{formatNumber(dashboardData.stats.products.total)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}