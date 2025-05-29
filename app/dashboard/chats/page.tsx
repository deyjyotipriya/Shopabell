'use client';

import { useState, useEffect } from 'react';
import { BiSearch, BiSend, BiPhone, BiVideo, BiMoreVertical, BiCheck, BiCheckDouble } from 'react-icons/bi';
import { FiPaperclip, FiImage, FiMic } from 'react-icons/fi';
import Image from 'next/image';

interface Chat {
  id: string;
  customer: {
    name: string;
    avatar: string;
    phone: string;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    text: string;
    time: string;
    sender: 'customer' | 'seller';
    status: 'sent' | 'delivered' | 'read';
  };
  unreadCount: number;
  productInquiry?: {
    id: string;
    name: string;
    image: string;
    price: number;
  };
}

interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'customer' | 'seller';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'product' | 'order';
  attachment?: {
    type: 'image' | 'product' | 'order';
    url?: string;
    product?: {
      id: string;
      name: string;
      image: string;
      price: number;
    };
  };
}

const demoChats: Chat[] = [
  {
    id: '1',
    customer: {
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f7?w=100',
      phone: '+91 98765 43210',
      isOnline: true,
      lastSeen: 'online'
    },
    lastMessage: {
      text: 'Is this saree available in royal blue color?',
      time: '2 min ago',
      sender: 'customer',
      status: 'delivered'
    },
    unreadCount: 2,
    productInquiry: {
      id: '1',
      name: 'Elegant Banarasi Silk Saree',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100',
      price: 2499
    }
  },
  {
    id: '2',
    customer: {
      name: 'Anita Patel',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      phone: '+91 98765 43211',
      isOnline: false,
      lastSeen: '1 hour ago'
    },
    lastMessage: {
      text: 'Thank you for the quick delivery! 😊',
      time: '1 hour ago',
      sender: 'customer',
      status: 'read'
    },
    unreadCount: 0
  },
  {
    id: '3',
    customer: {
      name: 'Sneha Reddy',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      phone: '+91 98765 43212',
      isOnline: true,
      lastSeen: 'online'
    },
    lastMessage: {
      text: 'Can you please share more images of the lehenga?',
      time: '3 hours ago',
      sender: 'customer',
      status: 'delivered'
    },
    unreadCount: 1
  },
  {
    id: '4',
    customer: {
      name: 'Kavya Nair',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      phone: '+91 98765 43213',
      isOnline: false,
      lastSeen: '2 days ago'
    },
    lastMessage: {
      text: 'What is the fabric of this kurta?',
      time: '2 days ago',
      sender: 'customer',
      status: 'read'
    },
    unreadCount: 0
  }
];

const demoMessages: { [key: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'Hi! I\'m interested in this beautiful saree.',
      time: '10:30 AM',
      sender: 'customer',
      status: 'read',
      type: 'text'
    },
    {
      id: '2',
      text: 'Hello! Thank you for your interest. This is one of our premium Banarasi silk sarees.',
      time: '10:32 AM',
      sender: 'seller',
      status: 'read',
      type: 'text'
    },
    {
      id: '3',
      text: 'Is this saree available in royal blue color?',
      time: '10:35 AM',
      sender: 'customer',
      status: 'delivered',
      type: 'text'
    }
  ],
  '2': [
    {
      id: '1',
      text: 'Order delivered successfully!',
      time: '2:00 PM',
      sender: 'seller',
      status: 'read',
      type: 'order'
    },
    {
      id: '2',
      text: 'Thank you for the quick delivery! 😊',
      time: '2:15 PM',
      sender: 'customer',
      status: 'read',
      type: 'text'
    }
  ]
};

export default function ChatsPage() {
  const [chats, setChats] = useState<Chat[]>(demoChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
  const [messages, setMessages] = useState<Message[]>(demoMessages['1'] || []);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.customer.phone.includes(searchTerm)
  );

  const selectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(demoMessages[chat.id] || []);
    
    // Mark messages as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'seller',
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in chat list
    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? {
            ...chat,
            lastMessage: {
              text: newMessage,
              time: 'now',
              sender: 'seller',
              status: 'sent'
            }
          }
        : chat
    ));
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <BiCheck className="w-4 h-4 text-gray-400" />;
      case 'delivered': return <BiCheckDouble className="w-4 h-4 text-gray-400" />;
      case 'read': return <BiCheckDouble className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Chats</h1>
        <p className="text-gray-600 mt-2">Manage customer conversations and inquiries</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-200px)]">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="overflow-y-auto h-full">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-purple-50 border-purple-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image
                        src={chat.customer.avatar}
                        alt={chat.customer.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      {chat.customer.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{chat.customer.name}</p>
                        <p className="text-xs text-gray-500">{chat.lastMessage.time}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">{chat.lastMessage.text}</p>
                        {chat.unreadCount > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.productInquiry && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-purple-600">
                          <Image
                            src={chat.productInquiry.image}
                            alt={chat.productInquiry.name}
                            width={20}
                            height={20}
                            className="rounded"
                          />
                          <span className="truncate">{chat.productInquiry.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={selectedChat.customer.avatar}
                          alt={selectedChat.customer.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        {selectedChat.customer.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedChat.customer.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedChat.customer.isOnline ? 'Online' : `Last seen ${selectedChat.customer.lastSeen}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <BiPhone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <BiVideo className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <BiMoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'seller' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'seller'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          message.sender === 'seller' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{message.time}</span>
                          {message.sender === 'seller' && getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <FiPaperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <FiImage className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <FiMic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}