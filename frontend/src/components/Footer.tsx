import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-footer-bg text-footer-text mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-logo-purple to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">SS</span>
              </div>
              <span className="ml-2 text-lg font-bold">SSecoM</span>
            </div>
            <p className="text-sm">
              Your trusted student ecommerce platform for exclusive discounts and university integration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/products" className="hover:text-white">Products</a></li>
              <li><a href="/cart" className="hover:text-white">Cart</a></li>
              <li><a href="/profile" className="hover:text-white">Profile</a></li>
            </ul>
          </div>

          {/* Student Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Student Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Student Discounts</a></li>
              <li><a href="#" className="hover:text-white">University Partners</a></li>
              <li><a href="#" className="hover:text-white">Campus Delivery</a></li>
              <li><a href="#" className="hover:text-white">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 SSecoM. All rights reserved. Built for students, by students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
