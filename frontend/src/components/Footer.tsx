// frontend/src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-red-900 text-orange-200 mt-auto relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-12 mb-16">
          
          {/* About SSM Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-xl font-bold text-white">SS</span>
              </div>
              <span className="text-2xl font-bold text-orange-200">SSecoM</span>
            </div>
            
            <h3 className="text-xl font-bold text-orange-200 mb-4 flex items-center">
              🎓 About SSM
            </h3>
            <h4 className="text-lg font-semibold text-orange-300 mb-4">
              Students Helping Students Shop Smarter
            </h4>
            <p className="text-orange-400 mb-6 leading-relaxed">
              We're a team of students who understand the struggle of finding quality products that fit student budgets. SSM curates the best products from across the web, so you can focus on what matters most - your education and experiences.
            </p>
            
            {/* <div className="space-y-2 mb-6">
              <a href="/story" className="text-orange-300 hover:text-orange-100 transition-colors font-medium block">
                Learn Our Story
              </a>
              <a href="/team" className="text-orange-300 hover:text-orange-100 transition-colors font-medium block">
                Meet the Team
              </a>
              <a href="/testimonials" className="text-orange-300 hover:text-orange-100 transition-colors font-medium block">
                Student Testimonials
              </a>
            </div> */}

            {/* Money-Back Promise */}
            <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-4 border border-orange-500/30 mb-6">
              <h4 className="text-lg font-bold text-orange-200 mb-2 flex items-center">
                💰 Money-Back Promise
              </h4>
              <p className="text-orange-300 text-sm italic">
                "Not satisfied with our recommendation? We'll help you find a better option or get your money back. That's the SSM guarantee."
              </p>
            </div>
          </div>

          {/* Shop by Category */}
          <div>
            <h3 className="text-xl font-bold text-orange-200 mb-6 flex items-center">
              🛍️ Shop by Category
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/category/daily-essentials" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Daily Essentials
                </a>
              </li>
              <li>
                <a href="/category/study-materials" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Study Materials
                </a>
              </li>
              <li>
                <a href="/category/electronics" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Electronics & Gadgets
                </a>
              </li>
              <li>
                <a href="/category/fashion" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Fashion & Clothing
                </a>
              </li>
              <li>
                <a href="/category/fitness" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Fitness & Health
                </a>
              </li>
              <li>
                <a href="/category/dorm-living" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Dorm & Living
                </a>
              </li>
              <li>
                <a href="/category/gaming" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Gaming Setup
                </a>
              </li>
              <li>
                <a href="/category/books-courses" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Books & Courses
                </a>
              </li>
              <li>
                <a href="/category/party-events" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Party & Events
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Help */}
          <div>
            <h3 className="text-xl font-bold text-orange-200 mb-6 flex items-center">
              🤝 Support & Help
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/contact" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Contact Our Student Support Team
                </a>
              </li>
              <li>
                <a href="/faq" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  FAQs - Quick Answers
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  How SSM Works
                </a>
              </li>
              {/* <li>
                <a href="/refund-policy" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Refund & Return Policy
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Shipping Information
                </a>
              </li>
              <li>
                <a href="/student-discounts" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Student Discount Program
                </a>
              </li> */}
            </ul>
          </div>

          {/* Student Perks & Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-orange-200 mb-6 flex items-center">
              🌟 Student Perks
            </h3>
            <ul className="space-y-3 text-sm mb-8">
              <li className="text-orange-300 font-medium">Free Product Research Service</li>
              <li className="text-orange-300 font-medium">24/7 Student Support Chat</li>
              <li className="text-orange-300 font-medium">Exclusive Campus Deals</li>
              <li className="text-orange-300 font-medium">Birthday Month Discounts</li>
              <li className="text-orange-300 font-medium">Referral Rewards Program</li>
            </ul>

            <h4 className="text-lg font-bold text-orange-200 mb-4 flex items-center">
              💡 Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/top-picks" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Today's Top Picks
                </a>
              </li>
              <li>
                <a href="/trending" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Trending This Week
                </a>
              </li>
              <li>
                <a href="/budget-finds" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Budget Finds Under ₹500
                </a>
              </li>
              <li>
                <a href="/exam-essentials" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  Exam Season Essentials
                </a>
              </li>
              <li>
                <a href="/starter-pack" className="text-orange-300 hover:text-orange-100 transition-colors font-medium">
                  New Student Starter Pack
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter & Social Media */}
        <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 mb-12 border border-orange-500/30">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-orange-200 mb-4 flex items-center justify-center">
              📱 Stay Connected
            </h3>
            <p className="text-orange-300 mb-6">
              Join 50,000+ Students Getting Smart Shopping Tips
            </p>
            
            {/* Newsletter Signup */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your student email"
                  className="flex-1 px-4 py-3 bg-gray-700 border border-orange-500/50 rounded-l-xl text-orange-200 placeholder-orange-400 focus:outline-none focus:border-orange-400"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-r-xl hover:from-orange-700 hover:to-red-700 transition-colors font-bold">
                  📧 Subscribe
                </button>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center space-x-6">
              <a href="https://instagram.com/studentstore_ssm" target="_blank" rel="noopener noreferrer" 
                 className="bg-gradient-to-br from-gray-700 to-black p-4 rounded-xl border border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg hover:shadow-orange-500/40">
                <span className="text-2xl">📸</span>
                <div className="text-xs text-orange-300 mt-1">@studentstore_ssm</div>
              </a>
              <a href="https://twitter.com/SSM_Students" target="_blank" rel="noopener noreferrer"
                 className="bg-gradient-to-br from-gray-700 to-black p-4 rounded-xl border border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg hover:shadow-orange-500/40">
                <span className="text-2xl">🐦</span>
                <div className="text-xs text-orange-300 mt-1">@SSM_Students</div>
              </a>
              <a href="https://youtube.com/SSMReviews" target="_blank" rel="noopener noreferrer"
                 className="bg-gradient-to-br from-gray-700 to-black p-4 rounded-xl border border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg hover:shadow-orange-500/40">
                <span className="text-2xl">📺</span>
                <div className="text-xs text-orange-300 mt-1">SSM Reviews</div>
              </a>
            </div>
          </div>
        </div>

        {/* Recognition & Stats */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Recognition */}
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-6 border border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-200 mb-4 flex items-center">
              🏆 Recognition
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⭐</span>
                <span className="text-orange-300">"Best Student Shopping Platform 2024" - Campus Life Magazine</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🥇</span>
                <span className="text-orange-300">50,000+ Happy Student Customers</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💎</span>
                <span className="text-orange-300">4.8/5 Star Rating - Trusted by Students Nationwide</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-gradient-to-br from-gray-800 to-black rounded-xl p-6 border border-orange-500/30">
            <div className="text-center">
              <h3 className="text-xl font-bold text-orange-200 mb-4">Our Commitment</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-xs text-orange-300 font-semibold">Secure Shopping</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📲</div>
                  <div className="text-xs text-orange-300 font-semibold">Best Recommendations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💵</div>
                  <div className="text-xs text-orange-300 font-semibold">Budget Friendly</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Policies */}
        <div className="border-t border-orange-500/30 pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-lg font-bold text-orange-200 mb-4">📋 Legal & Policies</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="/privacy" className="text-orange-300 hover:text-orange-100 transition-colors">Privacy Policy</a>
                <a href="/terms" className="text-orange-300 hover:text-orange-100 transition-colors">Terms of Service</a>
                <a href="/cookies" className="text-orange-300 hover:text-orange-100 transition-colors">Cookie Policy</a>
                <a href="/student-data" className="text-orange-300 hover:text-orange-100 transition-colors">Student Data Protection</a>
                <a href="/partner-disclosure" className="text-orange-300 hover:text-orange-100 transition-colors">Partner Disclosure</a>
              </div>
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <div className="text-orange-200 font-bold text-lg mb-2">Contact Us</div> 
                <div className="space-y-1 text-sm">
                  <div className="text-orange-300">📞 Student Helpline: 1800-SSM-HELP</div>
                  <div className="text-orange-300">📧 hello@studentstore-ssm.com</div>
                </div>
              </div>
            </div>
          </div> 

          {/* Copyright */}
          <div className="text-center mt-8 pt-6 border-t border-orange-500/20">
            <p className="text-orange-300 mb-2">
              © 2025 Student Store ecoM (SSM). Made with ❤️ by students, for students.
            </p>
            <p className="text-orange-400 font-semibold italic">
              "Your Success is Our Success. Shop Smart, Study Smarter."
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
