import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

interface UserSettings {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    security: boolean;
    marketing: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    dashboardLayout: 'compact' | 'expanded';
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserSettings>>({});
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: async () => {
      const { data } = await api.get('/user/settings');
      return data.data;
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      const { data } = await api.put('/user/settings', updatedSettings);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
  });



  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(settings || {});
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof UserSettings] as object || {}),
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-400">Manage your account preferences and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <UserIcon className="h-5 w-5 inline mr-3" />
                Profile
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'security' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheckIcon className="h-5 w-5 inline mr-3" />
                Security
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'notifications' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <BellIcon className="h-5 w-5 inline mr-3" />
                Notifications
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'preferences' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <GlobeAltIcon className="h-5 w-5 inline mr-3" />
                Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                {!isEditing ? (
                  <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={handleSave}>
                      Save Changes
                    </button>
                    <button className="btn btn-outline" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">
                    <span className="label-text">First Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Last Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Phone</span>
                  </label>
                  <input
                    type="tel"
                    className="input input-bordered w-full"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Timezone</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.timezone || ''}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Language</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.language || ''}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                      <p className="text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <label className="swap">
                      <input
                        type="checkbox"
                        checked={formData.security?.twoFactorEnabled || false}
                        onChange={(e) => handleNestedInputChange('security', 'twoFactorEnabled', e.target.checked)}
                      />
                      <div className="swap-on">ON</div>
                      <div className="swap-off">OFF</div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Biometric Authentication</h3>
                      <p className="text-gray-400">Use fingerprint or face recognition</p>
                    </div>
                    <label className="swap">
                      <input
                        type="checkbox"
                        checked={formData.security?.biometricEnabled || false}
                        onChange={(e) => handleNestedInputChange('security', 'biometricEnabled', e.target.checked)}
                      />
                      <div className="swap-on">ON</div>
                      <div className="swap-off">OFF</div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">Login Alerts</h3>
                      <p className="text-gray-400">Get notified of new login attempts</p>
                    </div>
                    <label className="swap">
                      <input
                        type="checkbox"
                        checked={formData.security?.loginAlerts || false}
                        onChange={(e) => handleNestedInputChange('security', 'loginAlerts', e.target.checked)}
                      />
                      <div className="swap-on">ON</div>
                      <div className="swap-off">OFF</div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Current Password</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">New Password</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="btn btn-primary">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                    <p className="text-gray-400">Receive notifications via email</p>
                  </div>
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.email || false}
                      onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.checked)}
                    />
                    <div className="swap-on">ON</div>
                    <div className="swap-off">OFF</div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">SMS Notifications</h3>
                    <p className="text-gray-400">Receive notifications via SMS</p>
                  </div>
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.sms || false}
                      onChange={(e) => handleNestedInputChange('notifications', 'sms', e.target.checked)}
                    />
                    <div className="swap-on">ON</div>
                    <div className="swap-off">OFF</div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                    <p className="text-gray-400">Receive push notifications</p>
                  </div>
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.push || false}
                      onChange={(e) => handleNestedInputChange('notifications', 'push', e.target.checked)}
                    />
                    <div className="swap-on">ON</div>
                    <div className="swap-off">OFF</div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Security Alerts</h3>
                    <p className="text-gray-400">Critical security notifications</p>
                  </div>
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.security || false}
                      onChange={(e) => handleNestedInputChange('notifications', 'security', e.target.checked)}
                    />
                    <div className="swap-on">ON</div>
                    <div className="swap-off">OFF</div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-6">Application Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="label">
                    <span className="label-text">Theme</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.preferences?.theme || 'dark'}
                    onChange={(e) => handleNestedInputChange('preferences', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Dashboard Layout</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.preferences?.dashboardLayout || 'expanded'}
                    onChange={(e) => handleNestedInputChange('preferences', 'dashboardLayout', e.target.value)}
                  >
                    <option value="compact">Compact</option>
                    <option value="expanded">Expanded</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Auto Refresh</h3>
                    <p className="text-gray-400">Automatically refresh dashboard data</p>
                  </div>
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={formData.preferences?.autoRefresh || false}
                      onChange={(e) => handleNestedInputChange('preferences', 'autoRefresh', e.target.checked)}
                    />
                    <div className="swap-on">ON</div>
                    <div className="swap-off">OFF</div>
                  </label>
                </div>
                {formData.preferences?.autoRefresh && (
                  <div>
                    <label className="label">
                      <span className="label-text">Refresh Interval (seconds)</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      value={formData.preferences?.refreshInterval || 30}
                      onChange={(e) => handleNestedInputChange('preferences', 'refreshInterval', parseInt(e.target.value))}
                      min="10"
                      max="300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
