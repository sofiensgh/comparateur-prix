// app/profile/admin/page.tsx - WORKING VERSION
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  FaUserShield, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaShieldAlt,
  FaSpinner
} from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

// Types for form data
interface ProfileFormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Helper function for alerts (temporary replacement for toast)
const showAlert = (message: string, type: 'success' | 'error' = 'info') => {
  alert(`${type.toUpperCase()}: ${message}`);
};

async function updateAdminProfile(
  userId: string, 
  formData: Partial<ProfileFormData>
): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    console.log('🔐 Attempting profile update for user:', userId);
    console.log('📤 Form data being sent:', {
      username: formData.username,
      email: formData.email,
      hasCurrentPassword: !!formData.currentPassword,
      hasNewPassword: !!formData.newPassword
    });
    
    // IMPORTANT: Use the admin route with cookies
    const endpoint = 'http://localhost:5000/api/admin/my-profile';
    
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ✅ CRITICAL: This sends cookies
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }),
    });
    
    console.log('📊 Update response status:', response.status);
    
    // Try to read the response even if it's an error
    let data;
    try {
      data = await response.json();
      console.log('📦 Update response data:', data);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Server returned invalid response');
    }
    
    if (!response.ok) {
      throw new Error(data?.message || `Update failed with status ${response.status}`);
    }

    return { 
      success: true, 
      message: data.message || 'Profile updated successfully', 
      user: data.user 
    };
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error. Please check your connection.' 
    };
  }
}

export default function AdminProfilePage() {
  const { user, loading: authLoading, isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, isAuthenticated, router]);

  // Debug: Check auth status
  const checkAuthStatus = async () => {
    try {
      setDebugInfo('Checking authentication...');
      
      // Test admin endpoint
      const testResponse = await fetch('http://localhost:5000/api/admin/test', {
        credentials: 'include',
      });
      
      const testData = await testResponse.json();
      setDebugInfo(`Admin test: ${testResponse.status} - ${testData.message || 'No message'}`);
      
      console.log('Admin test response:', testData);
      
    } catch (error) {
      setDebugInfo(`Auth check error: ${error}`);
      console.error('Auth check error:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      checkAuthStatus();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
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
    setDebugInfo('Saving profile...');
    
    try {
      const result = await updateAdminProfile(user.id, formData);
      
      if (result.success) {
        showAlert('Profile updated successfully!', 'success');
        setDebugInfo('✅ Profile update successful');
        
        // Refresh auth data
        await checkAuth();
        
        // Reset form state
        setIsEditing(false);
        setIsChangingPassword(false);
        setFormData({
          username: result.user?.username || user.username || '',
          email: result.user?.email || user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showAlert(result.message || 'Failed to update profile', 'error');
        setDebugInfo(`❌ Update failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      showAlert('An error occurred while updating your profile', 'error');
      setDebugInfo(`❌ Error: ${error}`);
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
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setValidationErrors({});
    setDebugInfo('Edit cancelled');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Debug Info - Remove in production */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
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

      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-full">
              <MdAdminPanelSettings className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Profile</h1>
              <p className="text-red-100">Manage your admin account settings</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
            <button
              onClick={checkAuthStatus}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUserShield /> Profile Information
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FaUser /> Edit Profile
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

            <div className="space-y-6">
              {/* Username Field */}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
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

              {/* Email Field */}
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
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

              {/* Role Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaUserShield className="text-red-600" />
                    <span className="font-bold text-red-700">Administrator</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Full system access and permissions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
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

            {isChangingPassword && (
              <div className="space-y-6">
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
            )}

            {!isChangingPassword && (
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
        </div>

        {/* Right Column - Admin Profile & Info */}
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Profile</h2>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold">{user.username}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                  Administrator
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <label className="block text-sm text-gray-500">Account Created</label>
                  <div className="font-medium">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Last Login</label>
                  <div className="font-medium">
                    {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500">Account Status</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt /> Security Tips
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mt-0.5">🔒</div>
                <div>
                  <p className="font-medium text-blue-800">Strong Passwords</p>
                  <p className="text-sm text-blue-600">Use unique, complex passwords</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="text-green-600 mt-0.5">🔄</div>
                <div>
                  <p className="font-medium text-green-800">Regular Updates</p>
                  <p className="text-sm text-green-600">Update your password regularly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="text-purple-600 mt-0.5">👁️</div>
                <div>
                  <p className="font-medium text-purple-800">Be Vigilant</p>
                  <p className="text-sm text-purple-600">Never share your credentials</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 group transition-colors text-left"
              >
                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200">
                  📊
                </div>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-red-600">
                    Admin Dashboard
                  </p>
                  <p className="text-sm text-gray-600">View system statistics</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 group transition-colors text-left"
              >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200">
                  👥
                </div>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-blue-600">
                    User Management
                  </p>
                  <p className="text-sm text-gray-600">Manage all users</p>
                </div>
              </button>
              <button
                onClick={() => router.push('/admin/settings')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 group transition-colors text-left"
              >
                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200">
                  ⚙️
                </div>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-green-600">
                    System Settings
                  </p>
                  <p className="text-sm text-gray-600">Configure system preferences</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}