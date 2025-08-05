'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import SearchBox from './SearchBox';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white shadow-sm border-b relative" ref={menuRef}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Little Victories
            </Link>
          </div>
          
          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/posts" className="text-gray-600 hover:text-blue-600 transition-colors">
                Posts
              </Link>


            </nav>
            <SearchBox />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-b z-50 animate-in slide-in-from-top-2 duration-200">
            <nav className="px-4 py-4 space-y-2">
              <Link 
                href="/" 
                className="block text-gray-600 hover:text-blue-600 transition-colors py-3 px-2 rounded-md hover:bg-gray-50"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-600 hover:text-blue-600 transition-colors py-3 px-2 rounded-md hover:bg-gray-50"
                onClick={closeMenu}
              >
                About
              </Link>
              <Link 
                href="/posts" 
                className="block text-gray-600 hover:text-blue-600 transition-colors py-3 px-2 rounded-md hover:bg-gray-50"
                onClick={closeMenu}
              >
                Posts
              </Link>


              {/* Mobile Search */}
              <div className="py-3 px-2">
                <SearchBox />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 