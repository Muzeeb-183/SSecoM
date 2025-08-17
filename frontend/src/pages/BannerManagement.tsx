// frontend/src/pages/admin/BannerManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageFileId?: string;
  ctaText?: string;
  ctaLink?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BannerManagement: React.FC = () => {
  const { user, token } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    priority: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all banners
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setBanners(data.banners);
        console.log('✅ Admin banners fetched:', data.banners.length);
      } else {
        toast.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('❌ Fetch banners error:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBanners();
    }
  }, [user, fetchBanners]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Banner title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('ctaText', formData.ctaText);
      formDataObj.append('ctaLink', formData.ctaLink);
      formDataObj.append('priority', formData.priority.toString());
      
      if (selectedFile) {
        formDataObj.append('bannerImage', selectedFile);
      }

      const url = editingBanner 
        ? `${import.meta.env.VITE_API_URL}/api/admin/banners/${editingBanner.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingBanner ? 'Banner updated successfully! 🔥' : 'Banner created successfully! 🔥');
        resetForm();
        fetchBanners();
      } else {
        toast.error(data.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('❌ Save banner error:', error);
      toast.error('Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: '', description: '', ctaText: '', ctaLink: '', priority: 0 });
    setSelectedFile(null);
    setShowCreateModal(false);
    setEditingBanner(null);
  };

  // Handle edit
  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      description: banner.description || '',
      ctaText: banner.ctaText || '',
      ctaLink: banner.ctaLink || '',
      priority: banner.priority
    });
    setEditingBanner(banner);
    setShowCreateModal(true);
  };

  // Handle delete
  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Banner deleted successfully! 🗑️');
        fetchBanners();
      } else {
        toast.error('Failed to delete banner');
      }
    } catch (error) {
      console.error('❌ Delete banner error:', error);
      toast.error('Failed to delete banner');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (bannerId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/banners/${bannerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchBanners();
      } else {
        toast.error('Failed to toggle banner status');
      }
    } catch (error) {
      console.error('❌ Toggle banner error:', error);
      toast.error('Failed to toggle banner status');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-orange-200 mb-2">Access Denied</h2>
          <p className="text-orange-400">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                🔥 Banner Management
              </h1>
              <p className="text-orange-300 text-lg">
                Create and manage promotional banners for your homepage
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg border border-orange-400"
            >
              🔥 Create Banner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
            <div className="text-3xl font-bold text-green-400">{banners.length}</div>
            <div className="text-orange-300">Total Banners</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
            <div className="text-3xl font-bold text-blue-400">{banners.filter(b => b.isActive).length}</div>
            <div className="text-orange-300">Active Banners</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
            <div className="text-3xl font-bold text-purple-400">{banners.filter(b => !b.isActive).length}</div>
            <div className="text-orange-300">Inactive Banners</div>
          </div>
        </div>

        {/* Banners List */}
        <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 border border-orange-500/30">
          <h2 className="text-2xl font-bold text-orange-200 mb-6">All Banners</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-300">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-bold text-orange-200 mb-2">No Banners Yet</h3>
              <p className="text-orange-400 mb-6">Create your first banner to get started!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all"
              >
                🔥 Create First Banner
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-orange-200">{banner.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          banner.isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-600 text-gray-200'
                        }`}>
                          {banner.isActive ? '✅ Active' : '❌ Inactive'}
                        </span>
                        <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Priority: {banner.priority}
                        </span>
                      </div>
                      
                      {banner.description && (
                        <p className="text-orange-300 mb-2">{banner.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-orange-400">
                        {banner.imageUrl && (
                          <span className="flex items-center">
                            <span className="mr-1">📷</span>
                            Has Image
                          </span>
                        )}
                        {banner.ctaText && (
                          <span className="flex items-center">
                            <span className="mr-1">🔗</span>
                            {banner.ctaText}
                          </span>
                        )}
                        <span>Created: {new Date(banner.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="Edit Banner"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(banner.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          banner.isActive 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        title={banner.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {banner.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete Banner"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 max-w-2xl w-full border border-orange-500/30 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-orange-200 mb-6">
                {editingBanner ? '✏️ Edit Banner' : '🔥 Create New Banner'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-orange-300 font-medium mb-2">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none"
                    placeholder="e.g., 🔥 Welcome to Student Store ecoM!"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-orange-300 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none h-24"
                    placeholder="Describe what this banner promotes..."
                  />
                </div>

                {/* CTA Text & Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-orange-300 font-medium mb-2">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                      className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-orange-300 font-medium mb-2">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                      className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none"
                      placeholder="/products or https://..."
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-orange-300 font-medium mb-2">
                    Priority (Higher = Shows First)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none"
                    min="0"
                    max="999"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-orange-300 font-medium mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full p-3 bg-gray-700 border border-orange-500/30 rounded-xl text-orange-100 focus:border-orange-400 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                  />
                  <p className="text-orange-400 text-sm mt-2">
                    Recommended: 800x400px or similar aspect ratio
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '⏳ Saving...' : editingBanner ? '✅ Update Banner' : '🔥 Create Banner'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
