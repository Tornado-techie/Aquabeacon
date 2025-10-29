// File: client/src/components/Footer.jsx

import React from 'react';
import { FiDroplet, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiDroplet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AquaBeacon</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Ensuring clean and safe water for all. Monitor water quality, report issues, 
              and connect with certified water businesses in Kenya.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <FiMail className="w-4 h-4" />
                <span className="text-sm">info@aquabeacon.co.ke</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
              <li><a href="#water-testing" className="text-gray-300 hover:text-white transition-colors">Water Testing</a></li>
              <li><a href="#businesses" className="text-gray-300 hover:text-white transition-colors">Certified Businesses</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-300">
                <FiPhone className="w-4 h-4" />
                <span className="text-sm">+254 700 000 000</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <FiMapPin className="w-4 h-4" />
                <span className="text-sm">Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} AquaBeacon. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;