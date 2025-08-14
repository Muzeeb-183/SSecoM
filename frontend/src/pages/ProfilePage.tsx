import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ UPDATED: Handle any file input (drag/drop or click)
  const handleFileFromDrop = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image will be automatically compressed to meet 2MB limit');
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    uploadProfilePicture(file);
  };

  // Handle file selection from input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileFromDrop(file);
  };

  // Upload profile picture
  const uploadProfilePicture = async (file: File) => {
    if (!user || !token) {
      toast.error('Please log in to update your profile picture');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile-picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user in AuthContext
        updateProfile({ picture: data.imageUrl });
        
        toast.success('🔥 Profile picture updated successfully!');
        setPreviewUrl(null); // Clear preview
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ FIXED: Handle drag and drop without synthetic events
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileFromDrop(file); // ✅ Use dedicated function
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-2xl font-bold text-orange-200 mb-4">Please Login</h1>
          <p className="text-orange-400">You need to be logged in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="relative bg-gray-800/90 backdrop-blur-lg rounded-3xl shadow-2xl shadow-orange-500/20 border border-orange-500/30 p-8 mb-8">
          
          {/* Fire Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-8 text-center">
              🔥 Fire Profile Settings
            </h1>

            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Profile Picture Section */}
              <div className="flex-shrink-0">
                <div className="text-center">
                  
                  {/* Current Profile Picture - ✅ FIXED WITH CACHE-BUSTING */}
                  <div className="relative mb-4">
                    <img 
                      src={previewUrl || `${user.picture}?t=${Date.now()}`} // ✅ CRITICAL FIX: Cache-busting timestamp
                      alt={user.name}
                      className="w-32 h-32 rounded-full border-4 border-orange-500 shadow-2xl shadow-orange-500/50 mx-auto object-cover"
                      onError={(e) => {
                        // Fallback to default avatar if image fails to load
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=f97316&color=fff&size=300`;
                      }}
                    />
                    
                    {/* Admin Crown */}
                    {user.role === 'admin' && (
                      <div className="absolute -top-2 -right-2 text-2xl">
                        👑
                      </div>
                    )}

                    {/* Upload Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                        <div className="text-orange-400">
                          <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ ENHANCED: Upload Button with Drag & Drop Zone */}
                  <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`relative border-2 border-dashed border-orange-500/50 rounded-xl p-4 transition-all duration-300 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500 hover:bg-orange-500/5 cursor-pointer'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-700 hover:via-red-600 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-400"
                    >
                      {isUploading ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Uploading...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>📸</span>
                          <span>Change Picture</span>
                        </span>
                      )}
                    </button>

                    <p className="text-xs text-orange-400 mt-3 text-center">
                      Drag & drop or click to upload<br />
                      <span className="text-orange-300 font-semibold">Max 2MB • Auto-compressed • Perfect circles</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-orange-200 mb-2">{user.name}</h2>
                <p className="text-orange-400 mb-4">{user.email}</p>
                
                {/* Role Badge */}
                <div className="mb-6">
                  {user.role === 'admin' ? (
                    <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔥 FIRE ADMIN 👑
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔥 Fire Student
                    </span>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-800/30 rounded-xl p-4 border border-green-500/30">
                    <div className="text-2xl font-bold text-green-200">₹2,450</div>
                    <div className="text-sm text-green-300">💰 Money Saved</div>
                  </div>
                  <div className="bg-blue-800/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-2xl font-bold text-blue-200">47</div>
                    <div className="text-sm text-blue-300">🛒 Orders</div>
                  </div>
                  <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="text-2xl font-bold text-purple-200">15</div>
                    <div className="text-sm text-purple-300">❤️ Wishlist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Profile Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Recent Activity */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 p-6">
            <h3 className="text-xl font-bold text-orange-200 mb-4">🔥 Recent Fire Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-orange-400">📱</span>
                <div>
                  <div className="text-sm font-bold text-orange-200">Profile Updated</div>
                  <div className="text-xs text-orange-400">Just now</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-blue-400">🛒</span>
                <div>
                  <div className="text-sm font-bold text-blue-200">Added to Cart</div>
                  <div className="text-xs text-blue-400">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                <span className="text-green-400">💰</span>
                <div>
                  <div className="text-sm font-bold text-green-200">Money Saved</div>
                  <div className="text-xs text-green-400">Yesterday</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-500/20 p-6">
            <h3 className="text-xl font-bold text-orange-200 mb-4">⚙️ Account Settings</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <span className="text-orange-400 group-hover:scale-110 transition-transform">🔔</span>
                  <div className="flex-1">
                    <div className="font-bold text-orange-200">Notifications</div>
                    <div className="text-xs text-orange-400">Manage your alerts</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 group-hover:scale-110 transition-transform">🔒</span>
                  <div className="flex-1">
                    <div className="font-bold text-red-200">Privacy</div>
                    <div className="text-xs text-red-400">Control your data</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-400 group-hover:scale-110 transition-transform">🎯</span>
                  <div className="flex-1">
                    <div className="font-bold text-blue-200">Preferences</div>
                    <div className="text-xs text-blue-400">Customize experience</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
