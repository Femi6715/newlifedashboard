"use client";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isLogin = pathname === '/login';

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      if (!isLogin && !isAuthenticated()) {
        router.push('/login');
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, isLogin, router, isClient]);

  // Don't render anything until we're mounted on the client
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isLogin && <Navigation />}
      <main className={isLogin ? '' : 'md:ml-64 pt-16 md:pt-0'}>
        <div className="responsive-padding">
          {children}
        </div>
      </main>
    </>
  );
} 