import React from 'react';
import { Sparkles, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

function Footer({ theme }) {
  return (
    <footer className="w-full bg-gray-900 text-white mt-12 md:mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${theme.accent} rounded-xl flex items-center justify-center`}>
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-xl md:text-2xl font-bold">Sweet Shop</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your destination for the finest handcrafted sweets and treats. 
              Made with love, delivered with care.
            </p>
            <div className="flex gap-3 md:gap-4">
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Products</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Delivery Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Contact Us</h4>
            <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="flex-shrink-0" />
                <span>123 Sweet Street, Candy City</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0" />
                <span>hello@sweetshop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-500 text-sm md:text-base">
          <p>© 2025 Sweet Shop. All rights reserved. Made with 🍬</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
