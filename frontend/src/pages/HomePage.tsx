import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-content-bg">
      {/* REMOVE THE HEADER SECTION - It's already rendered by App.tsx */}
      
      {/* Main Content - Keep this part */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-heading mb-4">
            Welcome to SSecoM, {user?.name?.split(' ')[0]}! 🎓
          </h2>
          <p className="text-lg text-subheading">
            Your Student Ecommerce Platform is ready to serve you
          </p>
          {user?.isUniversityStudent && (
            <p className="text-sm text-success-text mt-2">
              ✅ Verified university student from {user.universityDomain}
            </p>
          )}
        </div>

        {/* Student Dashboard Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card-student p-6">
            <h3 className="text-xl font-semibold text-heading mb-3">📚 Browse Products</h3>
            <p className="text-subheading mb-4">Discover student-focused products with exclusive discounts</p>
            <button className="btn-primary">Explore Catalog</button>
          </div>
          
          <div className="card-student p-6">
            <h3 className="text-xl font-semibold text-heading mb-3">🛒 My Orders</h3>
            <p className="text-subheading mb-4">Track your orders and purchase history</p>
            <button className="btn-primary">View Orders</button>
          </div>
          
          <div className="card-student p-6">
            <h3 className="text-xl font-semibold text-heading mb-3">👤 My Profile</h3>
            <p className="text-subheading mb-4">Update your student profile and preferences</p>
            <button className="btn-primary">Edit Profile</button>
          </div>
        </div>

        {/* User Info Debug (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">🔧 Debug Info (Development)</h4>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
