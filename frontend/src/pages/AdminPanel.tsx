// Update your AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminPanel: React.FC = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    estimatedRevenue: 0,
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard summary
  const fetchDashboardSummary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/dashboard-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.summary);
      } else {
        console.error('Failed to fetch dashboard summary');
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${Math.round(amount)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-content-bg to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-heading flex items-center">
                👑 Admin Panel
              </h1>
              <p className="text-subheading mt-2">
                Welcome back, {user?.name}! Manage your affiliate platform.
              </p>
            </div>
            <div className="bg-logo-purple text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-subheading">Total Users</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoading ? '...' : dashboardData.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-subheading">Products</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoading ? '...' : dashboardData.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-subheading">Est. Revenue</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoading ? '...' : formatCurrency(dashboardData.estimatedRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-subheading">Conversion</p>
                <p className="text-2xl font-bold text-heading">
                  {isLoading ? '...' : `${Math.round(dashboardData.conversionRate)}%`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              👥 User Management
            </h3>
            <p className="text-subheading mb-4">
              Manage users, assign roles, and monitor activity.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="w-full bg-logo-purple text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Manage Users
            </button>
          </div>

          {/* Product Management */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              🛍️ Product Management
            </h3>
            <p className="text-subheading mb-4">
              Add, edit, and manage affiliate products and deals.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/products'}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Products
            </button>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              📊 Analytics
            </h3>
            <p className="text-subheading mb-4">
              View detailed analytics and performance metrics.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/analytics'}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Analytics
            </button>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              ⚙️ Platform Settings
            </h3>
            <p className="text-subheading mb-4">
              Configure platform settings and preferences.
            </p>
            <button className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Settings
            </button>
          </div>

          {/* Admin Management */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              👑 Admin Management
            </h3>
            <p className="text-subheading mb-4">
              Grant or revoke admin access to users.
            </p>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Manage Admins
            </button>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-heading mb-4 flex items-center">
              📈 Reports
            </h3>
            <p className="text-subheading mb-4">
              Generate and download detailed reports.
            </p>
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              View Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg mt-8">
          <h3 className="text-xl font-bold text-heading mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-green-600 mr-3">✅</span>
              <span className="text-subheading">Real analytics system activated</span>
              <span className="ml-auto text-xs text-gray-500">Just now</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-blue-600 mr-3">🛍️</span>
              <span className="text-subheading">Product management system updated</span>
              <span className="ml-auto text-xs text-gray-500">5 minutes ago</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-purple-600 mr-3">👥</span>
              <span className="text-subheading">User management system deployed</span>
              <span className="ml-auto text-xs text-gray-500">15 minutes ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
