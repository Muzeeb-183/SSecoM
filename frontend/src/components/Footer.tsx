import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-footer-bg text-footer-text mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Trust Section */}
        <div className="bg-purple-50 rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">10,000+</div>
              <div className="text-sm text-gray-600">Happy Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">₹2.5L+</div>
              <div className="text-sm text-gray-600">Total Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Curated Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Deal Updates</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-logo-purple to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">SS</span>
              </div>
              <span className="ml-2 text-lg font-bold">SSecoM</span>
            </div>
            <p className="text-sm mb-4">
              🎯 Your trusted platform for student deals, discounts, and everything you need for college life!
            </p>
            <div className="text-sm text-purple-400">
              💰 Helping students save money since 2025
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-4">🛍️ Shop by Category</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/tech" className="hover:text-white">📱 Tech & Gadgets</a></li>
              <li><a href="/fashion" className="hover:text-white">👕 Fashion & Style</a></li>
              <li><a href="/courses" className="hover:text-white">📚 Online Courses</a></li>
              <li><a href="/fitness" className="hover:text-white">🏋️ Fitness & Health</a></li>
            </ul>
          </div>

          {/* Student Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-4">🎓 Student Zone</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">💰 Best Student Deals</a></li>
              <li><a href="#" className="hover:text-white">🏫 Campus Partnerships</a></li>
              <li><a href="#" className="hover:text-white">💡 Money Saving Tips</a></li>
              <li><a href="#" className="hover:text-white">🎯 Study Essentials</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4">🤝 Support & Info</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">❓ Help & FAQ</a></li>
              <li><a href="#" className="hover:text-white">📧 Contact Us</a></li>
              <li><a href="#" className="hover:text-white">🔒 Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">📋 Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="text-sm mb-2">
            <p>&copy; 2025 SSecoM. All rights reserved. Built for students, by students. 🎓</p>
          </div>
          <div className="text-xs text-gray-400">
            💡 Affiliate Disclaimer: We may earn commissions from purchases made through our links. 
            This helps us keep finding the best deals for students!
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
