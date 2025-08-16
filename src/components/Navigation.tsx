'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LevelUp
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/upload')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/topics"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/topics')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Topics
            </Link>
            <Link
              href="/final-exam"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/final-exam')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Final Exam
            </Link>
            <Link
              href="/progress"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/progress')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Progress
            </Link>
          </div>

          {/* Mobile menu button with animation */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white p-2 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 relative">
                {/* Top bar */}
                <span className={`absolute top-0 left-0 w-6 h-0.5 bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'rotate-0 translate-y-0'
                }`}></span>
                
                {/* Middle bar */}
                <span className={`absolute top-2.5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                
                {/* Bottom bar */}
                <span className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 origin-center ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : 'rotate-0 translate-y-0'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Home
            </Link>
            <Link
              href="/upload"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive('/upload')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/topics"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive('/topics')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Topics
            </Link>
            <Link
              href="/final-exam"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive('/final-exam')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Final Exam
            </Link>
            <Link
              href="/progress"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isActive('/progress')
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Progress
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
