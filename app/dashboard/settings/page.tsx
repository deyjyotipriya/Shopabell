'use client';

import { useState } from 'react';
import { BiNotification, BiSecurity, BiCreditCard, BiShield, BiLock, BiEye, BiEyeSlash, BiSave } from 'react-icons/bi';
import { FiSettings, FiBell, FiMail, FiSmartphone } from 'react-icons/fi';

interface Settings {
  notifications: {
    email: {
      orderUpdates: boolean;
      customerMessages: boolean;
      marketingEmails: boolean;
      weeklyReports: boolean;
    };
    push: {
      orderUpdates: boolean;
      customerMessages: boolean;
      lowStock: boolean;
      promotions: boolean;
    };
    sms: {
      orderUpdates: boolean;
      customerMessages: boolean;
      securityAlerts: boolean;
    };
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
  business: {
    autoReplyEnabled: boolean;
    autoReplyMessage: string;
    businessHours: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    lowStockThreshold: number;
    orderAutoAccept: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'customers' | 'private';
    showContact: boolean;
    showRating: boolean;
    analyticsSharing: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: {
        orderUpdates: true,
        customerMessages: true,
        marketingEmails: false,
        weeklyReports: true
      },
      push: {
        orderUpdates: true,
        customerMessages: true,
        lowStock: true,
        promotions: false
      },
      sms: {
        orderUpdates: true,
        customerMessages: false,
        securityAlerts: true
      }
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30
    },
    business: {
      autoReplyEnabled: true,
      autoReplyMessage: "Thank you for your message! We'll get back to you within 2 hours during business hours.",
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00',
        timezone: 'Asia/Kolkata'
      },
      lowStockThreshold: 5,
      orderAutoAccept: false
    },
    privacy: {
      profileVisibility: 'public',
      showContact: true,
      showRating: true,
      analyticsSharing: true
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');
  const [showPassword, setShowPassword] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: <FiBell className="w-4 h-4" /> },
    { id: 'security', name: 'Security', icon: <BiShield className="w-4 h-4" /> },
    { id: 'business', name: 'Business', icon: <FiSettings className="w-4 h-4" /> },
    { id: 'privacy', name: 'Privacy', icon: <BiLock className="w-4 h-4" /> }
  ];

  const updateSettings = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsChanged(true);
  };

  const updateNestedSettings = (section: keyof Settings, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
    setIsChanged(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    setIsChanged(false);
    // Show success toast
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and business settings</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              {/* Email Notifications */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(settings.notifications.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key === 'orderUpdates' && 'Order Updates'}
                          {key === 'customerMessages' && 'Customer Messages'}
                          {key === 'marketingEmails' && 'Marketing Emails'}
                          {key === 'weeklyReports' && 'Weekly Reports'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === 'orderUpdates' && 'Get notified when orders are placed or updated'}
                          {key === 'customerMessages' && 'Receive emails when customers send messages'}
                          {key === 'marketingEmails' && 'Tips, tutorials, and product updates'}
                          {key === 'weeklyReports' && 'Weekly business performance summaries'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSettings('notifications', 'email', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <BiNotification className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(settings.notifications.push).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key === 'orderUpdates' && 'Order Updates'}
                          {key === 'customerMessages' && 'Customer Messages'}
                          {key === 'lowStock' && 'Low Stock Alerts'}
                          {key === 'promotions' && 'Promotions & Offers'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === 'orderUpdates' && 'Instant notifications for new orders'}
                          {key === 'customerMessages' && 'Alerts when customers send messages'}
                          {key === 'lowStock' && 'Warnings when product stock is low'}
                          {key === 'promotions' && 'Special offers and promotional opportunities'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSettings('notifications', 'push', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-center space-x-2 mb-4">
                  <FiSmartphone className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(settings.notifications.sms).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key === 'orderUpdates' && 'Order Updates'}
                          {key === 'customerMessages' && 'Customer Messages'}
                          {key === 'securityAlerts' && 'Security Alerts'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {key === 'orderUpdates' && 'SMS alerts for important order updates'}
                          {key === 'customerMessages' && 'SMS when customers need urgent response'}
                          {key === 'securityAlerts' && 'Security-related notifications'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateNestedSettings('notifications', 'sms', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Login Alerts</p>
                      <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.loginAlerts}
                        onChange={(e) => updateSettings('security', 'loginAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={0}>Never</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Access</h3>
                <div className="space-y-4">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <BiLock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <BiSecurity className="w-4 h-4" />
                    <span>Download Account Data</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    <BiShield className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Auto-Reply Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable Auto-Reply</p>
                      <p className="text-sm text-gray-500">Automatically respond to customer messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.business.autoReplyEnabled}
                        onChange={(e) => updateSettings('business', 'autoReplyEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {settings.business.autoReplyEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Reply Message</label>
                      <textarea
                        value={settings.business.autoReplyMessage}
                        onChange={(e) => updateSettings('business', 'autoReplyMessage', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your auto-reply message..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Enable Business Hours</p>
                      <p className="text-sm text-gray-500">Show customers when you're available</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.business.businessHours.enabled}
                        onChange={(e) => updateNestedSettings('business', 'businessHours', 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {settings.business.businessHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={settings.business.businessHours.start}
                          onChange={(e) => updateNestedSettings('business', 'businessHours', 'start', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={settings.business.businessHours.end}
                          onChange={(e) => updateNestedSettings('business', 'businessHours', 'end', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory & Orders</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      value={settings.business.lowStockThreshold}
                      onChange={(e) => updateSettings('business', 'lowStockThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">Get alerted when product stock falls below this number</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Auto-Accept Orders</p>
                      <p className="text-sm text-gray-500">Automatically accept new orders without manual review</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.business.orderAutoAccept}
                        onChange={(e) => updateSettings('business', 'orderAutoAccept', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Who can see your profile?</label>
                    <select
                      value={settings.privacy.profileVisibility}
                      onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="public">Public (Everyone)</option>
                      <option value="customers">Customers Only</option>
                      <option value="private">Private (Only You)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Contact Information</p>
                      <p className="text-sm text-gray-500">Display your phone and email on your store</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showContact}
                        onChange={(e) => updateSettings('privacy', 'showContact', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Show Rating & Reviews</p>
                      <p className="text-sm text-gray-500">Display your seller rating and customer reviews</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.showRating}
                        onChange={(e) => updateSettings('privacy', 'showRating', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Share Analytics Data</p>
                      <p className="text-sm text-gray-500">Help improve ShopAbell by sharing anonymous usage data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.analyticsSharing}
                        onChange={(e) => updateSettings('privacy', 'analyticsSharing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {isChanged && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={saveSettings}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <BiSave className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}