'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import {
  MessageSquare,
  History,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface HeaderProps {
  currentPage?: 'chat' | 'conversations' | 'profile';
}

export function Header({ currentPage }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, router]);

  const handleNavigation = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const handleProfileClick = useCallback(() => {
    router.push('/profile');
  }, [router]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileNavigation = useCallback(
    (href: string) => {
      router.push(href);
      setIsMobileMenuOpen(false);
    },
    [router]
  );

  const navigationItems = [
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      current: currentPage === 'chat',
    },
    {
      name: 'Conversations',
      href: '/conversations',
      icon: History,
      current: currentPage === 'conversations',
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="text-primary h-6 w-6" />
              <span className="text-lg font-semibold">Dify Assistant</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={item.current ? 'default' : 'ghost'}
                  onClick={() => handleNavigation(item.href)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Button>
              );
            })}
          </nav>

          {/* Right Side - Credits and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Credits Display */}
            <div className="hidden sm:block">
              <CreditDisplay variant="compact" />
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden text-sm font-medium sm:block">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/support')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support & FAQ</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/legal')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Legal</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={handleMobileMenuToggle}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={item.current ? 'default' : 'ghost'}
                    onClick={() => handleMobileNavigation(item.href)}
                    className="flex w-full items-center justify-start space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
              <div className="border-t pt-2">
                <CreditDisplay variant="card" className="mb-2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
