// frontend/src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-red-900 text-orange-200 mt-auto relative overflow-hidden">
      
      {/* CRAZY FIRE BACKGROUND EFFECTS */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fire particles flying across footer */}
        <div className="absolute top-8 left-16 w-3 h-3 bg-orange-500 rounded-full animate-fire-fly opacity-80 blur-sm"></div>
        <div className="absolute top-20 right-24 w-2 h-2 bg-red-500 rounded-full animate-fire-fly-delay opacity-70 blur-sm"></div>
        <div className="absolute bottom-16 left-1/3 w-4 h-4 bg-yellow-500 rounded-full animate-fire-fly-fast opacity-60 blur-sm"></div>
        <div className="absolute bottom-8 right-1/4 w-2 h-2 bg-orange-600 rounded-full animate-fire-fly-reverse opacity-75 blur-sm"></div>
        
        {/* Lightning strikes */}
        <div className="absolute top-12 left-32 text-yellow-400 text-xl animate-lightning opacity-90">⚡</div>
        <div className="absolute top-24 right-40 text-orange-500 text-2xl animate-lightning-delay opacity-80">🔥</div>
        <div className="absolute bottom-20 left-2/3 text-red-500 text-xl animate-lightning-fast opacity-85">💥</div>
        
        {/* Fire glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 animate-fire-pulse"></div>
        
        {/* Fire stroke borders */}
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-500 via-orange-500 to-yellow-500 animate-fire-stroke opacity-70"></div>
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-yellow-500 via-orange-500 to-red-500 animate-fire-stroke-reverse opacity-70"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-fire-flow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* FIRE TRUST SECTION */}
        <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 mb-12 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/30 relative overflow-hidden">
          
          {/* Fire background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-fire-pulse"></div>
          <div className="absolute inset-0 rounded-2xl animate-border-fire opacity-20"></div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center relative z-10">
            <div className="group hover:scale-110 transition-transform">
              <div className="text-3xl font-bold text-orange-400 mb-2 animate-count-up group-hover:animate-explode">
                10,000+
              </div>
              <div className="text-sm text-orange-300 font-semibold">🔥 Fire Students</div>
            </div>
            <div className="group hover:scale-110 transition-transform">
              <div className="text-3xl font-bold text-red-400 mb-2 animate-count-up group-hover:animate-explode">
                ₹2.5L+
              </div>
              <div className="text-sm text-red-300 font-semibold">💰 Cash Burned (Saved)</div>
            </div>
            <div className="group hover:scale-110 transition-transform">
              <div className="text-3xl font-bold text-yellow-400 mb-2 animate-count-up group-hover:animate-explode">
                500+
              </div>
              <div className="text-sm text-yellow-300 font-semibold">🛍️ Fire Products</div>
            </div>
            <div className="group hover:scale-110 transition-transform">
              <div className="text-3xl font-bold text-orange-400 mb-2 animate-count-up group-hover:animate-explode">
                24/7
              </div>
              <div className="text-sm text-orange-300 font-semibold">⚡ Deal Explosions</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-10">
          
          {/* FIRE COMPANY INFO */}
          <div className="group">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/50 group-hover:rotate-12 transition-all duration-300 animate-fire-glow border-2 border-orange-400">
                  <span className="text-lg font-bold text-white group-hover:scale-110 transition-transform animate-text-fire">
                    SSM
                  </span>
                </div>
                
                {/* Fire sparks around logo */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-explode opacity-90 blur-sm"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-500 rounded-full animate-spark opacity-80"></div>
              </div>
              <span className="ml-3 text-xl font-bold text-orange-200 group-hover:text-orange-100 transition-colors animate-text-glow">
                SSecoM
              </span>
            </div>
            
            <p className="text-sm mb-6 text-orange-300 font-semibold leading-relaxed">
              🔥 Your INSANE platform for student deals that are so hot they'll melt your wallet! 
              💥 We bring the FIRE to college life!
            </p>
            
            <div className="text-sm text-orange-400 font-bold animate-pulse">
              💰 Making students RICH since 2025! 🚀
            </div>
          </div>

          {/* FIRE CATEGORIES */}
          <div className="group">
            <h3 className="text-lg font-bold mb-6 text-orange-200 group-hover:text-orange-100 transition-colors animate-text-fire">
              🔥 FIRE CATEGORIES
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/tech" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-bounce">📱</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Tech & Fire Gadgets</span>
                </a>
              </li>
              <li>
                <a href="/fashion" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-bounce">👕</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Fashion That Burns</span>
                </a>
              </li>
              <li>
                <a href="/courses" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-bounce">📚</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Explosive Courses</span>
                </a>
              </li>
              <li>
                <a href="/fitness" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-bounce">🏋️</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Fitness Fire Power</span>
                </a>
              </li>
            </ul>
          </div>

          {/* FIRE STUDENT ZONE */}
          <div className="group">
            <h3 className="text-lg font-bold mb-6 text-orange-200 group-hover:text-orange-100 transition-colors animate-text-fire">
              💥 STUDENT BATTLEFIELD
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-explode">💰</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">INSANE Student Deals</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-explode">🏫</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Campus Fire Partnerships</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-explode">💡</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Money Burning Tips</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-explode">🎯</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Study Fire Essentials</span>
                </a>
              </li>
            </ul>
          </div>

          {/* FIRE SUPPORT */}
          <div className="group">
            <h3 className="text-lg font-bold mb-6 text-orange-200 group-hover:text-orange-100 transition-colors animate-text-fire">
              ⚡ FIRE SUPPORT
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-lightning">❓</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Help & Fire FAQ</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-lightning">📧</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Contact Fire Support</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-lightning">🔒</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Privacy Fire Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-100 transition-colors flex items-center space-x-2 group/item">
                  <span className="group-hover/item:animate-lightning">📋</span>
                  <span className="group-hover/item:text-orange-100 font-semibold">Terms of Fire Service</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* FIRE SOCIAL MEDIA SECTION */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-orange-200 mb-6 animate-text-fire">
            🔥 FOLLOW THE FIRE 💥
          </h3>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="group bg-gradient-to-br from-gray-800 to-black p-4 rounded-2xl border-2 border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
              <span className="text-2xl group-hover:animate-bounce">📸</span>
              <div className="text-xs text-orange-300 mt-1 font-semibold">Instagram</div>
            </a>
            <a href="#" className="group bg-gradient-to-br from-gray-800 to-black p-4 rounded-2xl border-2 border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
              <span className="text-2xl group-hover:animate-bounce">🐦</span>
              <div className="text-xs text-orange-300 mt-1 font-semibold">Twitter</div>
            </a>
            <a href="#" className="group bg-gradient-to-br from-gray-800 to-black p-4 rounded-2xl border-2 border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
              <span className="text-2xl group-hover:animate-bounce">📺</span>
              <div className="text-xs text-orange-300 mt-1 font-semibold">YouTube</div>
            </a>
            <a href="#" className="group bg-gradient-to-br from-gray-800 to-black p-4 rounded-2xl border-2 border-orange-500/50 hover:border-orange-400 transition-all transform hover:scale-110 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
              <span className="text-2xl group-hover:animate-bounce">💼</span>
              <div className="text-xs text-orange-300 mt-1 font-semibold">LinkedIn</div>
            </a>
          </div>
        </div>

        {/* FIRE BOTTOM SECTION */}
        <div className="border-t-2 border-gradient-to-r border-orange-500/50 mt-12 pt-8 text-center relative">
          
          {/* Fire line animation */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-fire-flow"></div>
          
          <div className="text-sm mb-4">
            <p className="text-orange-200 font-bold animate-text-glow">
              &copy; 2025 SSecoM. All rights reserved. Built for FIRE students, by FIRE warriors! 🔥💪
            </p>
          </div>
          
          <div className="text-xs text-orange-400 max-w-4xl mx-auto leading-relaxed">
            💡 <strong>Affiliate Fire Disclaimer:</strong> We may earn INSANE commissions from purchases made through our fire links. 
            This helps us keep finding the most EXPLOSIVE deals for students! Every click feeds the fire! 🔥💰
          </div>
          
          {/* Fire badges */}
          <div className="flex justify-center space-x-4 mt-6">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-full text-xs font-bold animate-fire-badge border border-green-400">
              🔒 100% SECURE
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold animate-fire-badge border border-blue-400">
              ⚡ INSTANT DEALS
            </div>
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold animate-fire-badge border border-red-400">
              🔥 FIRE GUARANTEED
            </div>
          </div>
        </div>

        {/* FLOATING FIRE ELEMENTS */}
        <div className="absolute bottom-4 left-8 text-orange-500 text-sm animate-bounce opacity-80">🔥</div>
        <div className="absolute bottom-8 right-12 text-red-500 text-lg animate-pulse opacity-70">💥</div>
        <div className="absolute top-16 right-16 text-yellow-500 text-sm animate-spin opacity-60">⚡</div>
      </div>
    </footer>
  );
};

export default Footer;
