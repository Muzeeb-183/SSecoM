// frontend/src/pages/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  users: {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    newUsersThisMonth: number;
    activeUsersThisWeek: number;
  };
  categories: {
    totalCategories: number;
    activeCategories: number;
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    newProductsThisMonth: number;
  };
  productsByCategory: Array<{
    categoryName: string;
    productCount: number;
  }>;
  recentActivity: Array<{
    name?: string;
    email?: string;
    productName?: string;
    categoryName?: string;
    createdAt: string;
    activityType: 'user_registered' | 'product_added';
  }>;
  revenue: {
    estimatedMonthlyRevenue: number;
    estimatedConversionRate: number;
  };
  lastUpdated: string;
}

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch detailed analytics
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh analytics
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed!');
  };

  useEffect(() => {
    fetchAnalytics();
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

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-content-bg to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-logo-purple mx-auto mb-4"></div>
          <p className="text-lg font-medium text-heading">Loading Analytics...</p>
          <p className="text-sm text-subheading">Analyzing your platform data</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-content-bg to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-heading mb-2">Analytics Unavailable</h2>
          <p className="text-subheading mb-4">Unable to load analytics data</p>
          <button
            onClick={fetchAnalytics}
            className="bg-logo-purple text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-content-bg to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-heading flex items-center">
                📊 Analytics Dashboard
              </h1>
              <p className="text-subheading mt-2">
                Comprehensive insights for your affiliate marketing platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  refreshing 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-logo-purple text-white hover:bg-purple-700'
                }`}
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subheading">Total Users</p>
                <p className="text-3xl font-bold text-heading">{analytics.users.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{analytics.users.newUsersThisMonth} this month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subheading">Active Products</p>
                <p className="text-3xl font-bold text-heading">{analytics.products.activeProducts}</p>
                <p className="text-xs text-blue-600 mt-1">
                  +{analytics.products.newProductsThisMonth} this month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subheading">Est. Revenue</p>
                <p className="text-3xl font-bold text-heading">
                  {formatCurrency(analytics.revenue.estimatedMonthlyRevenue)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Monthly projection
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-subheading">Conversion Rate</p>
                <p className="text-3xl font-bold text-heading">
                  {formatPercentage(analytics.revenue.estimatedConversionRate)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Estimated rate
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Analytics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-heading mb-6 flex items-center">
              👥 User Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-heading">Total Registered Users</p>
                  <p className="text-sm text-subheading">All-time registrations</p>
                </div>
                <p className="text-2xl font-bold text-logo-purple">{analytics.users.totalUsers}</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-heading">Administrators</p>
                  <p className="text-sm text-subheading">Platform admins</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{analytics.users.adminUsers}</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-heading">Active This Week</p>
                  <p className="text-sm text-subheading">Recent activity</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{analytics.users.activeUsersThisWeek}</p>
              </div>
            </div>
          </div>

          {/* Product Analytics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-heading mb-6 flex items-center">
              🛍️ Product Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-heading">Average Product Price</p>
                  <p className="text-sm text-subheading">Mean price across all products</p>
                </div>
                <p className="text-2xl font-bold text-logo-purple">
                  {formatCurrency(analytics.products.averagePrice)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="font-medium text-heading">Lowest Price</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(analytics.products.minPrice)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="font-medium text-heading">Highest Price</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(analytics.products.maxPrice)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-heading">Categories</p>
                  <p className="text-sm text-subheading">Active categories</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{analytics.categories.activeCategories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products by Category */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-heading mb-6 flex items-center">
            📂 Products by Category
          </h3>
          
          {analytics.productsByCategory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.productsByCategory.map((category, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-heading">{category.categoryName}</p>
                      <p className="text-sm text-subheading">
                        {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-logo-purple">{category.productCount}</p>
                    </div>
                  </div>
                  
                  {/* Simple progress bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-logo-purple h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(10, (category.productCount / Math.max(...analytics.productsByCategory.map(c => c.productCount))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📂</div>
              <p className="text-subheading">No categories with products yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-heading mb-6 flex items-center">
            📈 Recent Activity
          </h3>
          
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="mr-4">
                    {activity.activityType === 'user_registered' ? (
                      <span className="text-2xl">👤</span>
                    ) : (
                      <span className="text-2xl">🛍️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    {activity.activityType === 'user_registered' ? (
                      <div>
                        <p className="font-medium text-heading">New user registered</p>
                        <p className="text-sm text-subheading">{activity.name} ({activity.email})</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-heading">Product added</p>
                        <p className="text-sm text-subheading">
                          {activity.productName} in {activity.categoryName}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-subheading">No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
