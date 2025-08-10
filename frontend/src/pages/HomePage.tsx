import React from 'react';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Mock data - Later we'll get this from your admin panel
  const featuredProducts = [
    {
      id: 1,
      name: "MacBook Air M3 - Perfect for Students",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop",
      originalPrice: "₹1,24,900",
      studentDiscount: "₹1,14,900",
      category: "Tech",
      affiliateLinks: [
        { platform: "Amazon", link: "#", color: "bg-orange-500" },
        { platform: "Flipkart", link: "#", color: "bg-blue-500" },
        { platform: "Croma", link: "#", color: "bg-green-500" }
      ],
      rating: 4.8,
      studentsLove: 1240
    },
    {
      id: 2,
      name: "Nike Air Force 1 - Campus Style",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
      originalPrice: "₹8,995",
      studentDiscount: "₹7,195",
      category: "Fashion",
      affiliateLinks: [
        { platform: "Amazon", link: "#", color: "bg-orange-500" },
        { platform: "Myntra", link: "#", color: "bg-pink-500" },
        { platform: "Nike", link: "#", color: "bg-black" }
      ],
      rating: 4.6,
      studentsLove: 856
    },
    {
      id: 3,
      name: "Complete Web Development Course",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop",
      originalPrice: "₹3,999",
      studentDiscount: "₹599",
      category: "Courses",
      affiliateLinks: [
        { platform: "Udemy", link: "#", color: "bg-purple-600" },
        { platform: "Coursera", link: "#", color: "bg-blue-600" }
      ],
      rating: 4.9,
      studentsLove: 2340
    }
  ];

  const categories = [
    { name: "📱 Tech", count: 245, trend: "+12%" },
    { name: "👕 Fashion", count: 189, trend: "+8%" },
    { name: "📚 Courses", count: 156, trend: "+25%" },
    { name: "🏋️ Fitness", count: 98, trend: "+15%" },
    { name: "🎧 Accessories", count: 167, trend: "+6%" },
    { name: "📖 Books", count: 234, trend: "+3%" }
  ];

  return (
    <div className="min-h-screen bg-content-bg">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section - Hook Students Immediately */}
        <div className="text-center mb-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-heading mb-4">
            Hey {user?.name?.split(' ')[0]}! 🎉 
            <span className="block text-2xl mt-2 text-purple-600">
              Save BIG on Everything Students Need!
            </span>
          </h1>
          <p className="text-lg text-subheading mb-6">
            🔥 <strong>Exclusive student discounts</strong> • 🚀 <strong>Latest trends</strong> • 💰 <strong>Best deals curated daily</strong>
          </p>
          
          {/* Quick Stats to Build Trust */}
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">10,000+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹2.5L+</div>
              <div className="text-gray-600">Money Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-gray-600">Products Added</div>
            </div>
          </div>
        </div>

        {/* Trending Categories - Easy Browse */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-heading mb-6 text-center">
            🔥 Trending Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <div 
                key={index}
                className="card-student p-4 text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="text-2xl mb-2">{category.name}</div>
                <div className="text-sm text-gray-600">{category.count} items</div>
                <div className="text-xs text-green-600 font-semibold">{category.trend} this week</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products - Money Makers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-heading mb-6 text-center">
            ⭐ Hand-Picked for Students Like You
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="card-student overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2"
              >
                {/* Product Image */}
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    STUDENT DEAL
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Product Info */}
                  <h3 className="font-bold text-lg mb-2 text-heading">{product.name}</h3>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
                    <span className="text-green-600 font-bold text-xl ml-2">{product.studentDiscount}</span>
                    <div className="text-xs text-purple-600 font-semibold">
                      💰 You save ₹{parseInt(product.originalPrice.replace(/[₹,]/g, '')) - parseInt(product.studentDiscount.replace(/[₹,]/g, ''))}!
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="flex items-center mb-4 text-sm">
                    <div className="flex text-yellow-400">
                      {'⭐'.repeat(Math.floor(product.rating))}
                    </div>
                    <span className="ml-2 text-gray-600">{product.rating}</span>
                    <span className="ml-4 text-purple-600">
                      ❤️ {product.studentsLove} students love this
                    </span>
                  </div>

                  {/* Affiliate Buttons - Your Money Makers! */}
                  <div className="space-y-2">
                    {product.affiliateLinks.map((link, index) => (
                      <button
                        key={index}
                        className={`w-full py-2 px-4 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105 ${link.color}`}
                        onClick={() => {
                          // Track click analytics here
                          console.log(`Affiliate click: ${product.name} -> ${link.platform}`);
                          window.open(link.link, '_blank');
                        }}
                      >
                        Buy from {link.platform} →
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Motivation - Keep Them Coming Back */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">💡 Student Success Tip of the Day</h2>
          <p className="text-lg">
            "Smart students don't just study hard - they shop smart too! 
            Save money on essentials and invest in your future. 🎯"
          </p>
          <button className="mt-4 bg-white text-purple-600 px-6 py-2 rounded-full font-semibold hover:scale-105 transition-all">
            Get More Daily Tips
          </button>
        </div>

        {/* Quick Actions - Easy Navigation */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card-student p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <div className="text-3xl mb-3">🛒</div>
            <h3 className="text-lg font-semibold text-heading mb-2">Browse All Products</h3>
            <p className="text-sm text-subheading">500+ curated items</p>
          </div>
          
          <div className="card-student p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-heading mb-2">My Wishlist</h3>
            <p className="text-sm text-subheading">Save for later</p>
          </div>
          
          <div className="card-student p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold text-heading mb-2">Best Deals</h3>
            <p className="text-sm text-subheading">Updated hourly</p>
          </div>
          
          <div className="card-student p-6 text-center hover:shadow-lg transition-all cursor-pointer">
            <div className="text-3xl mb-3">👑</div>
            <h3 className="text-lg font-semibold text-heading mb-2">Student Exclusive</h3>
            <p className="text-sm text-subheading">Members only deals</p>
          </div>
        </div>

        {/* Development Debug - Keep This */}
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
