'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BiHome,
  BiPackage,
  BiVideo,
  BiChart,
  BiStore,
  BiUser,
  BiCog,
  BiLogOut,
  BiMenu,
  BiX,
  BiCart,
  BiMessageSquare
} from 'react-icons/bi';
import { HiSpeakerphone } from 'react-icons/hi';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <BiHome className="w-5 h-5" /> },
  { name: 'Orders', href: '/dashboard/orders', icon: <BiCart className="w-5 h-5" /> },
  { name: 'Chats', href: '/dashboard/chats', icon: <BiMessageSquare className="w-5 h-5" /> },
  { name: 'Products', href: '/dashboard/products', icon: <BiPackage className="w-5 h-5" /> },
  { name: 'Analytics', href: '/dashboard/analytics', icon: <BiChart className="w-5 h-5" /> },
  { name: 'Store', href: '/dashboard/store', icon: <BiStore className="w-5 h-5" /> },
];

const bottomNavigation: NavItem[] = [
  { name: 'Profile', href: '/dashboard/profile', icon: <BiUser className="w-5 h-5" /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <BiCog className="w-5 h-5" /> },
];

interface SellerInfo {
  businessName: string;
  category: string;
  upiId: string;
  phone: string;
  storeUrl: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);

  useEffect(() => {
    // Load seller info from localStorage
    const storedSellerInfo = localStorage.getItem('sellerInfo');
    if (storedSellerInfo) {
      try {
        setSellerInfo(JSON.parse(storedSellerInfo));
      } catch (error) {
        console.error('Error parsing seller info:', error);
      }
    }
  }, []);

  const isActive = (href: string) => pathname === href;
  const businessName = sellerInfo?.businessName || 'Your Business';
  const userInitials = businessName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <span className="text-xl font-bold text-gray-900">Shopabell</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {userInitials}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{businessName}</h3>
                <p className="text-sm text-gray-500">{sellerInfo?.category || 'Premium Seller'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="px-4 py-4 space-y-1 border-t border-gray-200">
            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">
              <BiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 bg-white shadow-sm lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-700 hover:text-purple-600"
            >
              <BiMenu className="w-6 h-6" />
            </button>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-gray-900">Shopabell</span>
            </Link>
            <div className="w-6 h-6" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}