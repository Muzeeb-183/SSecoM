import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Simple admin check for now (later we'll make this proper)
  const isAdmin = user?.email === 'your-admin-email@gmail.com'; // Replace with your email

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-content-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-content-bg">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">
            🛠️ Admin Panel
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Manage your affiliate products and track performance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: '📊 Dashboard', icon: '📊' },
                { id: 'products', name: '🛍️ Products', icon: '🛍️' },
                { id: 'categories', name: '📂 Categories', icon: '📂' },
                { id: 'analytics', name: '📈 Analytics', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-bold mb-6">📊 Dashboard Overview</h2>
              
              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Clicks Today</div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹0</div>
                  <div className="text-sm text-gray-600">Est. Earnings</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">🚀 Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      ➕ Add New Product
                    </button>
                    <button 
                      onClick={() => setActiveTab('categories')}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      📂 Manage Categories
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      📈 View Analytics
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">📋 Recent Activity</h3>
                  <div className="text-gray-500 text-center py-8">
                    No recent activity yet.
                    <br />
                    <span className="text-sm">Start by adding your first product!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2 className="text-xl font-bold mb-6">🛍️ Product Management</h2>
              <p className="text-gray-600">Product management features coming in next step...</p>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-xl font-bold mb-6">📂 Category Management</h2>
              <p className="text-gray-600">Category management features coming soon...</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-xl font-bold mb-6">📈 Analytics & Performance</h2>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
