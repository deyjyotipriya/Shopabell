'use client';

import { useState, useEffect } from 'react';
import { BiEdit, BiSave, BiUser, BiPhone, BiMail, BiMapPin, BiCalendar, BiStore, BiTrendingUp } from 'react-icons/bi';
import { FiCamera, FiAward, FiStar } from 'react-icons/fi';
import Image from 'next/image';

interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  joinedDate: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  rating: number;
  totalSales: number;
  totalOrders: number;
  achievements: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<SellerProfile>({
    id: 'demo-seller-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f7?w=200',
    businessName: 'Priya Fashion House',
    category: 'Fashion & Accessories',
    description: 'Passionate about bringing authentic Indian ethnic wear to modern women. Specializing in handcrafted sarees, designer lehengas, and contemporary kurtis.',
    location: 'Jaipur, Rajasthan',
    joinedDate: '2023-03-15',
    verificationStatus: 'verified',
    rating: 4.8,
    totalSales: 125600,
    totalOrders: 342,
    achievements: ['Top Seller', 'Premium Verified', '5-Star Rating', 'Fast Shipper'],
    socialLinks: {
      instagram: 'priyafashionhouse',
      facebook: 'priyafashionhouse'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  useEffect(() => {
    // Load seller info from localStorage
    const storedSellerInfo = localStorage.getItem('sellerInfo');
    if (storedSellerInfo) {
      try {
        const info = JSON.parse(storedSellerInfo);
        setSellerInfo(info);
        setProfile(prev => ({
          ...prev,
          businessName: info.businessName || prev.businessName,
          category: info.category || prev.category
        }));
      } catch (error) {
        console.error('Error parsing seller info:', error);
      }
    }
  }, []);

  const saveProfile = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // Show success toast
  };

  const getVerificationBadge = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            <FiAward className="w-4 h-4 mr-1" />
            Verified Seller
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Verification Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and business information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="relative inline-block mb-4">
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={100}
                height={100}
                className="rounded-full mx-auto"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700">
                  <FiCamera className="w-4 h-4" />
                </button>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
            <p className="text-gray-600 mb-3">{profile.businessName}</p>
            
            {getVerificationBadge()}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-lg font-bold text-gray-900">{profile.rating}</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{profile.totalOrders}</p>
                <p className="text-sm text-gray-600">Orders</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center mb-4">
                <p className="text-lg font-bold text-green-600">₹{profile.totalSales.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>
              
              {/* Achievements */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Achievements</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.achievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <BiSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <BiEdit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BiUser className="inline w-4 h-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BiMail className="inline w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BiPhone className="inline w-4 h-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BiMapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Business Information */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BiStore className="inline w-4 h-4 mr-1" />
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={profile.category}
                      onChange={(e) => setProfile(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                    >
                      <option value="Fashion & Accessories">Fashion & Accessories</option>
                      <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Food & Beverages">Food & Beverages</option>
                      <option value="Books & Education">Books & Education</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={!isEditing}
                    placeholder="Tell customers about your business and what makes it special..."
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input
                      type="text"
                      value={profile.socialLinks.instagram || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input
                      type="text"
                      value={profile.socialLinks.facebook || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      disabled={!isEditing}
                      placeholder="page-name"
                    />
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <BiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">{new Date(profile.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <BiTrendingUp className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Status</p>
                      <p className="text-sm text-gray-600">Active Premium Seller</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}