'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Settings, Users, Mail, BarChart, FileText, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';
import { getClientSession, signOut } from '@/lib/auth/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-3 py-2 rounded-md transition-colors',
        isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100',
      )}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      const session = await getClientSession();
      setUser(session?.user || null);
    };

    loadUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.refresh(); // Refresh the page to update auth state
      router.push('/'); // Redirect to home page
    }
  };

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

  // Navigation items configuration
  const primaryNavItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: '/day',
      label: 'Today',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  // More specialized navigation items
  const secondaryNavItems = [
    {
      href: '/contacts',
      label: 'Contacts',
      icon: <Users className="w-5 h-5" />,
    },
    {
      href: '/email',
      label: 'Email',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: <BarChart className="w-5 h-5" />,
    },
    {
      href: '/documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  // Settings & configuration
  const configNavItems = [
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
      {/* App logo & name */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <div className="rounded-md bg-primary-600 w-8 h-8 flex items-center justify-center mr-2">
            <span className="text-white font-semibold">L</span>
          </div>
          <span className="text-xl font-bold text-primary-600">Life OS</span>
        </Link>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto py-4 px-4">
        {/* Primary navigation */}
        <nav className="space-y-1 mb-8">
          {primaryNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={
                pathname === item.href || (item.href === '/day' && pathname.startsWith('/day/'))
              }
            />
          ))}
        </nav>

        {/* Secondary navigation */}
        <div className="mb-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Modules
          </h3>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </nav>
        </div>

        {/* Configuration/settings navigation */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Configuration
          </h3>
          <nav className="space-y-1">
            {configNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* User section */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                <span className="text-sm font-medium">{getUserInitials()}</span>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.user_metadata?.name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/login"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Log in
          </Link>
        </div>
      )}
    </aside>
  );
}
