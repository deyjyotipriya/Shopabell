'use client';

import { useState, useEffect } from 'react';
import { BiSearch, BiFilter, BiDownload, BiMessageSquare, BiPhone, BiMapPin, BiCalendar, BiPackage } from 'react-icons/bi';
import { FiEye, FiPhone, FiMail } from 'react-icons/fi';
import Image from 'next/image';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
    location: string;
    totalOrders: number;
    totalSpent: number;
    joinedDate: string;
  };
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    variant?: string;
  }>;
  amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  date: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
  };
  trackingNumber?: string;
  notes?: string;
}

const demoOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    customer: {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      email: 'priya.sharma@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f7?w=100',
      location: 'Mumbai, Maharashtra',
      totalOrders: 8,
      totalSpent: 18750,
      joinedDate: '2023-06-15'
    },
    items: [
      {
        id: '1',
        name: 'Elegant Banarasi Silk Saree',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100',
        quantity: 1,
        price: 2499,
        variant: 'Red - Free Size'
      }
    ],
    amount: 2499,
    status: 'delivered',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    date: '2024-01-07',
    shippingAddress: {
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      address: '123, Marine Drive, Nariman Point',
      pincode: '400001',
      city: 'Mumbai',
      state: 'Maharashtra'
    },
    trackingNumber: 'TRK123456789',
    notes: 'Customer requested fast delivery for wedding'
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    customer: {
      name: 'Anita Patel',
      phone: '+91 98765 43211',
      email: 'anita.patel@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      location: 'Ahmedabad, Gujarat',
      totalOrders: 12,
      totalSpent: 24300,
      joinedDate: '2023-04-20'
    },
    items: [
      {
        id: '3',
        name: 'Designer Lehenga Choli',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100',
        quantity: 1,
        price: 4999,
        variant: 'Pink - L'
      }
    ],
    amount: 4999,
    status: 'shipped',
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    date: '2024-01-07',
    shippingAddress: {
      name: 'Anita Patel',
      phone: '+91 98765 43211',
      address: '45, Satellite Road, Vastrapur',
      pincode: '380015',
      city: 'Ahmedabad',
      state: 'Gujarat'
    },
    trackingNumber: 'TRK123456790'
  },
  {
    id: '3',
    orderNumber: 'ORD003',
    customer: {
      name: 'Sneha Reddy',
      phone: '+91 98765 43212',
      email: 'sneha.reddy@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      location: 'Hyderabad, Telangana',
      totalOrders: 5,
      totalSpent: 8950,
      joinedDate: '2023-08-10'
    },
    items: [
      {
        id: '2',
        name: 'Cotton Anarkali Kurti Set',
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=100',
        quantity: 2,
        price: 899,
        variant: 'Blue - M'
      }
    ],
    amount: 1798,
    status: 'processing',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    date: '2024-01-06',
    shippingAddress: {
      name: 'Sneha Reddy',
      phone: '+91 98765 43212',
      address: '78, Jubilee Hills, Road No. 36',
      pincode: '500033',
      city: 'Hyderabad',
      state: 'Telangana'
    }
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(demoOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Order['customer'] | null>(null);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const viewCustomerProfile = (customer: Order['customer']) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-2">Manage orders and customer interactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <BiDownload className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-full"
                          src={order.customer.avatar}
                          alt={order.customer.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <Image
                          key={index}
                          src={item.image}
                          alt={item.name}
                          width={32}
                          height={32}
                          className="rounded"
                        />
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-500">+{order.items.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{order.amount.toLocaleString()}</div>
                    <div className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.paymentStatus}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => viewCustomerProfile(order.customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <BiMessageSquare className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <FiPhone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                    <p><span className="font-medium">Location:</span> {selectedOrder.customer.location}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Payment:</span> {selectedOrder.paymentMethod}</p>
                    {selectedOrder.trackingNumber && (
                      <p><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Image src={item.image} alt={item.name} width={50} height={50} className="rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Print Invoice
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Message
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Modal */}
      {showCustomerDetail && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Customer Profile</h2>
                <button
                  onClick={() => setShowCustomerDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="text-center mb-6">
                <Image
                  src={selectedCustomer.avatar}
                  alt={selectedCustomer.name}
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                <p className="text-gray-500">{selectedCustomer.location}</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BiCalendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Joined {new Date(selectedCustomer.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Send Message
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Call Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}