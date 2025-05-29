'use client';

import { useState, useEffect } from 'react';
import { BiEdit, BiEye, BiShare, BiCopy, BiPalette, BiImage, BiSave } from 'react-icons/bi';
import { FiExternalLink, FiSettings } from 'react-icons/fi';
import Image from 'next/image';

interface StoreSettings {
  name: string;
  description: string;
  logo: string;
  banner: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
  policies: {
    shipping: string;
    returns: string;
    payment: string;
  };
  isPublic: boolean;
  customDomain?: string;
}

export default function StorePage() {
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Priya Fashion House',
    description: 'Authentic Indian ethnic wear for modern women. Premium quality sarees, kurtis, and lehengas crafted with love.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899', 
      accent: '#06b6d4'
    },
    contact: {
      phone: '+91 98765 43210',
      email: 'contact@priyafashionhouse.com',
      address: 'Shop 15, Fashion Street, Jaipur, Rajasthan 302001',
      whatsapp: '+91 98765 43210',
      instagram: 'priyafashionhouse',
      facebook: 'priyafashionhouse'
    },
    policies: {
      shipping: 'Free shipping on orders above ₹999. Orders shipped within 24-48 hours via trusted courier partners.',
      returns: '7-day easy returns. Product must be unused with original packaging. Return shipping charges applicable.',
      payment: '100% secure payments. We accept all major payment methods including UPI, Credit/Debit cards, Net Banking, and COD.'
    },
    isPublic: true
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load seller info from localStorage
    const storedSellerInfo = localStorage.getItem('sellerInfo');
    if (storedSellerInfo) {
      try {
        const info = JSON.parse(storedSellerInfo);
        setSellerInfo(info);
        setStoreSettings(prev => ({
          ...prev,
          name: info.businessName || prev.name
        }));
      } catch (error) {
        console.error('Error parsing seller info:', error);
      }
    }
  }, []);

  const storeUrl = `${window.location.origin}/store/${storeSettings.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    // Show toast notification
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // Show success toast
  };

  const tabs = [
    { id: 'general', name: 'General', icon: <FiSettings className="w-4 h-4" /> },
    { id: 'appearance', name: 'Appearance', icon: <BiPalette className="w-4 h-4" /> },
    { id: 'contact', name: 'Contact & Social', icon: <BiShare className="w-4 h-4" /> },
    { id: 'policies', name: 'Policies', icon: <BiEdit className="w-4 h-4" /> }
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-2">Customize your store appearance and settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open(storeUrl, '_blank')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <BiEye className="w-4 h-4" />
              <span>Preview Store</span>
              <FiExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={copyStoreUrl}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <BiCopy className="w-4 h-4" />
              <span>Copy Store Link</span>
            </button>
          </div>
        </div>

        {/* Store URL */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Your Store URL</label>
              <p className="text-purple-600 font-mono">{storeUrl}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                storeSettings.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {storeSettings.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        </div>
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Status</label>
                  <select
                    value={storeSettings.isPublic ? 'public' : 'private'}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  >
                    <option value="public">Public (Visible to everyone)</option>
                    <option value="private">Private (Only visible to you)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                <textarea
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                  placeholder="Tell customers about your store and products..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={storeSettings.logo}
                      alt="Store Logo"
                      width={80}
                      height={80}
                      className="rounded-lg border border-gray-200"
                    />
                    {isEditing && (
                      <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <BiImage className="w-4 h-4" />
                        <span>Change Logo</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
                  <div className="relative">
                    <Image
                      src={storeSettings.banner}
                      alt="Store Banner"
                      width={200}
                      height={80}
                      className="rounded-lg border border-gray-200 object-cover"
                    />
                    {isEditing && (
                      <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-2 text-white">
                          <BiImage className="w-4 h-4" />
                          <span>Change Banner</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Color Scheme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeSettings.colors.primary}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      disabled={!isEditing}
                    />
                    <input
                      type="text"
                      value={storeSettings.colors.primary}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeSettings.colors.secondary}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      disabled={!isEditing}
                    />
                    <input
                      type="text"
                      value={storeSettings.colors.secondary}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={storeSettings.colors.accent}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      disabled={!isEditing}
                    />
                    <input
                      type="text"
                      value={storeSettings.colors.accent}
                      onChange={(e) => setStoreSettings(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
                <div className="space-y-3">
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: storeSettings.colors.primary }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: storeSettings.colors.secondary }}
                  >
                    Secondary Button
                  </div>
                  <div
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: storeSettings.colors.accent }}
                  >
                    Accent Element
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={storeSettings.contact.phone}
                    onChange={(e) => setStoreSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={storeSettings.contact.email}
                    onChange={(e) => setStoreSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={storeSettings.contact.whatsapp}
                    onChange={(e) => setStoreSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, whatsapp: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Handle</label>
                  <input
                    type="text"
                    value={storeSettings.contact.instagram}
                    onChange={(e) => setStoreSettings(prev => ({
                      ...prev,
                      contact: { ...prev.contact, instagram: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <textarea
                  value={storeSettings.contact.address}
                  onChange={(e) => setStoreSettings(prev => ({
                    ...prev,
                    contact: { ...prev.contact, address: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy</label>
                <textarea
                  value={storeSettings.policies.shipping}
                  onChange={(e) => setStoreSettings(prev => ({
                    ...prev,
                    policies: { ...prev.policies, shipping: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                <textarea
                  value={storeSettings.policies.returns}
                  onChange={(e) => setStoreSettings(prev => ({
                    ...prev,
                    policies: { ...prev.policies, returns: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Policy</label>
                <textarea
                  value={storeSettings.policies.payment}
                  onChange={(e) => setStoreSettings(prev => ({
                    ...prev,
                    policies: { ...prev.policies, payment: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <BiSave className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <BiEdit className="w-4 h-4" />
                <span>Edit Store</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}