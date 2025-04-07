'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell, X, LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh the page to update auth state
    router.push('/'); // Redirect to home page
  };

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    loadUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return 'U';

    const email = user.email;
    const name = user.user_metadata?.name || email;

    if (name.includes(' ')) {
      const [first, last] = name.split(' ');
      return `${first[0]}${last[0]}`.toUpperCase();
    }

    return name[0].toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-4 md:px-6 mx-auto flex items-center justify-between">
        {/* Left section: Mobile menu button (visible only on mobile) */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        </div>

        {/* Middle section: Search bar */}
        <div className="flex-1 flex justify-center md:justify-start px-4">
          <div
            className={`relative w-full max-w-md transition-all duration-200 ${
              isSearchFocused ? 'md:w-[28rem]' : 'md:w-64'
            }`}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right section: User profile and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform -translate-y-1/3 translate-x-1/3"></span>
          </Button>

          {/* User profile/avatar */}
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleUserMenu}
                className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white"
              >
                <span className="text-sm font-medium">{getUserInitials()}</span>
              </Button>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Your Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                Log in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu (visible only when toggled on mobile) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-lg px-6 py-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-primary-600">Life OS</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </Button>
            </div>

            {/* Mobile navigation */}
            <nav className="space-y-6">
              <Link
                href="/"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/day"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                Today
              </Link>
              <Link
                href="/settings"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100"
                onClick={toggleMobileMenu}
              >
                Settings
              </Link>

              {!user && (
                <>
                  <Link
                    href="/login"
                    className="block py-2.5 px-4 rounded transition duration-200 bg-primary-50 text-primary-700"
                    onClick={toggleMobileMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100"
                    onClick={toggleMobileMenu}
                  >
                    Sign up
                  </Link>
                </>
              )}

              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="block w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100 text-red-600"
                >
                  Sign out
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
