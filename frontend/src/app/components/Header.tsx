"use client";

import { Menu, X } from 'lucide-react';
import { useState } from 'react';


interface LinktreeHeaderProps {
  onSignUp: (data?: { email?: string }) => void;
  onLogin: () => void;
}

export default function Header({ onSignUp, onLogin }:LinktreeHeaderProps) {
      const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  return ( <header className="relative bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">LinkHub</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
              <button
                onClick={onLogin}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => onSignUp()}
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
              >
                Sign up free
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-gray-900">Reviews</a>
              <button
                onClick={onLogin}
                className="block w-full text-left text-gray-600 hover:text-gray-900"
              >
                Log in
              </button>
              <button
                onClick={() => onSignUp()}
                className="block w-full bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
              >
                Sign up free
              </button>
            </div>
          </div>
        )}
      </header>
  )
}
