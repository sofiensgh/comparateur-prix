// app/components/NotificationSettings.tsx
'use client';

import { useState } from 'react';
import { FaBell, FaEnvelope, FaPhone, FaCheck } from 'react-icons/fa';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    priceAlerts: true,
    newsletter: true,
    securityAlerts: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSaveSettings = () => {
    // Save settings to API
    console.log('Saving notification settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Notification Preferences</h3>
          <p className="text-gray-600">Choose how you want to receive notifications</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition-colors`}
        >
          {saved ? <FaCheck /> : 'Save Changes'}
          {saved ? 'Saved!' : ''}
        </button>
      </div>

      {/* Notification Channels */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaBell /> Notification Channels
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FaEnvelope />
              </div>
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <FaPhone />
              </div>
              <div>
                <p className="font-medium text-gray-800">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive SMS alerts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={() => handleToggle('smsNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <FaBell />
              </div>
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">Browser and app notifications</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Notification Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-800">Order Updates</p>
              <p className="text-sm text-gray-600">Shipping and delivery updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.orderUpdates}
                onChange={() => handleToggle('orderUpdates')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-800">Promotional Emails</p>
              <p className="text-sm text-gray-600">Special offers and discounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promotionalEmails}
                onChange={() => handleToggle('promotionalEmails')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-800">Price Alerts</p>
              <p className="text-sm text-gray-600">Price drop notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.priceAlerts}
                onChange={() => handleToggle('priceAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-800">Newsletter</p>
              <p className="text-sm text-gray-600">Weekly updates and news</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newsletter}
                onChange={() => handleToggle('newsletter')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-gray-800">Security Alerts</p>
              <p className="text-sm text-gray-600">Login and security notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.securityAlerts}
                onChange={() => handleToggle('securityAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Frequency Settings */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Frequency Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Frequency</label>
            <select className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Immediately</option>
              <option>Daily Digest</option>
              <option>Weekly Digest</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours</label>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <select className="px-4 py-2 border rounded-lg">
                  <option>9:00 PM</option>
                  <option>10:00 PM</option>
                  <option>11:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <select className="px-4 py-2 border rounded-lg">
                  <option>7:00 AM</option>
                  <option>8:00 AM</option>
                  <option>9:00 AM</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">No notifications will be sent during quiet hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}