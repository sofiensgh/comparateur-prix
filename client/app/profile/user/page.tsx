// app/profile/user/page.tsx - DYNAMIC USER PROFILE (FIXED VERSION)
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FaUser, 
  FaShoppingCart, 
  FaHeart, 
  FaHistory,
  FaEdit,
  FaLock,
  FaBoxOpen,
  FaCreditCard,
  FaEnvelope,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaSpinner,
  FaCalendar,
  FaMapMarkerAlt,
  FaPhone,
  FaShieldAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

// Types
interface ProfileFormData {
  username: string;
  email: string;
  phone?: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserStats {
  orders: number;
  favorites: number;
  reviews: number;
  loyaltyPoints: number;
}

const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  alert(`${type.toUpperCase()}: ${message}`);
};

async function updateUserProfile(
  userId: string, 
  formData: Partial<ProfileFormData>
): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    console.log('🔐 Attempting profile update for user:', userId);
    console.log('📤 Form data being sent:', {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      hasCurrentPassword: !!formData.currentPassword,
      hasNewPassword: !!formData.newPassword
    });
    
    // Choose the appropriate endpoint based on what we're updating
    let endpoint;
    let bodyData: any = {};
    
    if (formData.newPassword) {
      // If changing password, use the standalone password change endpoint
      endpoint = 'http://localhost:5000/api/users/change-password';
      bodyData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      };
    } else {
      // If updating profile info, use the profile update endpoint
      endpoint = 'http://localhost:5000/api/users/profile';
      bodyData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone
      };
    }
    
    console.log('📡 Sending to endpoint:', endpoint);
    console.log('📦 Request body:', bodyData);
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(bodyData),
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text first
    const responseText = await response.text();
    console.log('📦 Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📦 Parsed response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.error('Raw response was:', responseText);
      return {
        success: false,
        message: 'Server returned invalid response. Please check server logs.'
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        message: data?.message || `Update failed with status ${response.status}`
      };
    }

    return { 
      success: true, 
      message: data.message || 'Profile updated successfully', 
      user: data.user 
    };
    
  } catch (error) {
    console.error('❌ Network error updating profile:', error);
    return { 
      success: false, 
      message: 'Network error. Please check your connection and ensure the backend server is running.' 
    };
  }
}

async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    // First try the stats endpoint
    const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
      credentials: 'include',
    });
    
    console.log('📊 Stats response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Stats response data:', data);
      
      // Return mock stats for now (you'll need to create a stats endpoint)
      return {
        orders: data.user?.ordersCount || 5,
        favorites: data.user?.favoritesCount || 3,
        reviews: data.user?.reviewsCount || 2,
        loyaltyPoints: data.user?.loyaltyPoints || 1250
      };
    }
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
  }
  
  // Return default values if fetch fails
  return {
    orders: 0,
    favorites: 0,
    reviews: 0,
    loyaltyPoints: 0
  };
}

// Simple Order History Component (since original import might be missing)
function OrderHistory({ preview = false, limit = 3 }: { preview?: boolean; limit?: number }) {
  return (
    <div className="space-y-4">
      {[1, 2, 3].slice(0, limit).map((order) => (
        <div key={order} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Order #{12300 + order}</h4>
              <p className="text-sm text-gray-600">Placed on Jan {10 + order}, 2024</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Delivered
            </span>
          </div>
          <div className="mt-2">
            <p className="font-bold">${(49.99 * order).toFixed(2)}</p>
          </div>
        </div>
      ))}
      
      {preview && (
        <div className="text-center pt-2">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All Orders →
          </button>
        </div>
      )}
    </div>
  );
}

// Simple Favorites Component
function FavoritesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="border rounded-lg p-4">
          <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
          <h4 className="font-semibold">Product Name {item}</h4>
          <p className="text-gray-600 text-sm">Category</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold">$29.99</span>
            <button className="text-red-500 hover:text-red-600">
              <FaHeart />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple Address Book Component
function AddressBook({ userId }: { userId: string }) {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaMapMarkerAlt className="text-blue-500" />
              <h4 className="font-semibold">Home Address</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Default
              </span>
            </div>
            <p className="text-gray-800">John Doe</p>
            <p className="text-gray-600">123 Main Street</p>
            <p className="text-gray-600">New York, NY 10001</p>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <FaEdit />
          </button>
        </div>
      </div>
      
      <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <FaMapMarkerAlt className="text-gray-400 text-2xl" />
          <span className="text-gray-700">Add New Address</span>
        </div>
      </button>
    </div>
  );
}

// Simple Notification Settings Component
function NotificationSettings({ userId }: { userId: string }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">Email Notifications</p>
          <p className="text-sm text-gray-600">Receive updates via email</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">SMS Notifications</p>
          <p className="text-sm text-gray-600">Receive text messages</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={() => setSmsNotifications(!smsNotifications)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-gray-600">Browser and app notifications</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={() => setPushNotifications(!pushNotifications)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { user, loading: authLoading, isAuthenticated, checkAuth, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    orders: 0,
    favorites: 0,
    reviews: 0,
    loyaltyPoints: 0
  });
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string>('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Fetch user stats
      loadUserStats();
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadUserStats = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const stats = await fetchUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required';
      }
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (isEditing) {
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.phone = 'Phone number is invalid';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user || !validateForm()) {
      showAlert('Please fix the errors before saving', 'error');
      return;
    }

    setIsSubmitting(true);
    setConnectionError('');
    
    try {
      const result = await updateUserProfile(user.id, formData);
      
      if (result.success) {
        showAlert('Profile updated successfully!', 'success');
        
        // Refresh auth data
        await checkAuth();
        
        // Reset form state
        setIsEditing(false);
        setIsChangingPassword(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        showAlert(result.message || 'Failed to update profile', 'error');
        setConnectionError(result.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showAlert(errorMessage, 'error');
      setConnectionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setConnectionError('');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const testConnection = async () => {
    try {
      setDebugInfo('Testing connection to backend...');
      const response = await fetch('http://localhost:5000/api/users/test', {
        credentials: 'include',
      });
      const data = await response.json();
      setDebugInfo(`✅ Connection successful: ${data.message || 'Backend is responding'}`);
    } catch (error) {
      setDebugInfo(`❌ Connection failed: ${error}`);
      console.error('Connection test error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'orders', label: 'My Orders', icon: <FaShoppingCart /> },
    { id: 'favorites', label: 'Favorites', icon: <FaHeart /> },
    { id: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  const statCards = [
    { 
      label: 'Total Orders', 
      value: userStats.orders.toString(), 
      icon: <FaBoxOpen />, 
      color: 'blue',
      description: 'All-time purchases'
    },
    { 
      label: 'Favorites', 
      value: userStats.favorites.toString(), 
      icon: <FaHeart />, 
      color: 'pink',
      description: 'Saved items'
    },
    { 
      label: 'Reviews', 
      value: userStats.reviews.toString(), 
      icon: <FaHistory />, 
      color: 'yellow',
      description: 'Product reviews'
    },
    { 
      label: 'Loyalty Points', 
      value: userStats.loyaltyPoints.toString(), 
      icon: <FaCreditCard />, 
      color: 'green',
      description: 'Available points'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Debug Info */}
      <div className="mb-4 space-y-2">
        {debugInfo && (
          <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                <strong>Debug:</strong> {debugInfo}
              </div>
              <button
                onClick={() => setDebugInfo('')}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {connectionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle />
              <span className="font-medium">Connection Error:</span>
              <span>{connectionError}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
        >
          Test Backend Connection
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
              <span className="text-2xl md:text-3xl font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.username}!</h1>
              <p className="text-blue-100">Manage your account and preferences</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {user.role.toUpperCase()}
                </span>
                <span className="text-sm">Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 md:px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 md:px-6 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-4 md:p-6 sticky top-6">
            <nav className="space-y-1 md:space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsEditing(false);
                    setIsChangingPassword(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium text-sm md:text-base">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* User Stats */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-3 md:mb-4">Your Stats</h3>
              {loadingStats ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {statCards.map((stat, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            stat.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                            stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {stat.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm md:text-base">{stat.label}</div>
                            <div className="text-xs text-gray-500">{stat.description}</div>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-gray-900">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              validationErrors.username ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your username"
                          />
                          {validationErrors.username && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium">{user.username}</p>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              validationErrors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your email"
                          />
                          {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium">{user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your phone number"
                          />
                          {validationErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium">{user.phone || 'Not provided'}</p>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Account Type</label>
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
                          <FaUser className="w-4 h-4" />
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Member Since</label>
                        <div className="font-medium">{formatDate(user.createdAt)}</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Account Status</label>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-600">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaLock /> Security Settings
                  </h2>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <FaLock /> Change Password
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsChangingPassword(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isChangingPassword ? (
                  <div className="space-y-6 max-w-md">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${
                            validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {validationErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      {validationErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin" /> Updating...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaLock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Password Security
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Last changed: {formatDate(user.lastPasswordChange || user.createdAt)}
                    </p>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    View All <FaShoppingCart />
                  </button>
                </div>
                <OrderHistory preview={true} limit={3} />
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">My Orders</h2>
                <p className="text-gray-600 mt-1">View and track your orders</p>
              </div>
              <div className="p-6">
                <OrderHistory preview={false} />
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">My Favorites</h2>
                <p className="text-gray-600 mt-1">Your saved items</p>
              </div>
              <div className="p-6">
                <FavoritesList />
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Address Book</h2>
              <AddressBook userId={user.id} />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <FaLock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">Two-Factor Authentication</h3>
                        <p className="text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <FaShieldAlt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">Active Sessions</h3>
                        <p className="text-gray-600">Manage your active login sessions</p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                      View Sessions
                    </button>
                  </div>
                </div>

                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                        <FaSignOutAlt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">Log Out Everywhere</h3>
                        <p className="text-gray-600">Sign out from all devices</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Logout All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h2>
              <NotificationSettings userId={user.id} />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Language & Region</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Language</label>
                      <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>English</option>
                        <option>French</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Time Zone</label>
                      <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>UTC-05:00 Eastern Time</option>
                        <option>UTC-08:00 Pacific Time</option>
                        <option>UTC+00:00 GMT</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Who can see your profile</p>
                      </div>
                      <select className="px-4 py-2 border rounded-lg">
                        <option>Public</option>
                        <option>Private</option>
                        <option>Friends Only</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive email updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}