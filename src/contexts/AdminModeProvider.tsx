'use client';

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface AdminModeContextType {
  isAdminMode: boolean;
  isLoading: boolean;
  enableAdminMode: () => void;
  disableAdminMode: () => void;
  getAdminUrl: (url: string) => string;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

function AdminModeProviderInner({ children }: { children: ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check URL parameter first (case insensitive)
    const adminParam = searchParams?.get('admin')?.toLowerCase();
    
    // Check localStorage for persistent admin state
    const storedAdminMode = typeof window !== 'undefined' 
      ? localStorage.getItem('adminMode') === 'true' 
      : false;

    if (adminParam === 'true') {
      // URL parameter takes precedence
      setIsAdminMode(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminMode', 'true');
      }
    } else if (adminParam === 'false') {
      // Explicitly disable admin mode
      setIsAdminMode(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminMode');
      }
    } else if (storedAdminMode) {
      // Use stored state if no URL parameter
      setIsAdminMode(true);
      // Add admin parameter to URL if not present
      if (adminParam !== 'true') {
        const newSearchParams = new URLSearchParams(searchParams?.toString());
        newSearchParams.set('admin', 'true');
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }
    } else {
      setIsAdminMode(false);
    }

    setIsLoading(false);
  }, [searchParams, router, pathname]);

  const enableAdminMode = () => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.set('admin', 'true');
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const disableAdminMode = () => {
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.delete('admin');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminMode');
    }
    router.push(`${pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`);
  };

  const getAdminUrl = (url: string): string => {
    if (!isAdminMode || typeof window === 'undefined') return url;
    
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('admin', 'true');
    return urlObj.pathname + urlObj.search;
  };

  return (
    <AdminModeContext.Provider
      value={{
        isAdminMode,
        isLoading,
        enableAdminMode,
        disableAdminMode,
        getAdminUrl,
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function AdminModeProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminModeProviderInner>{children}</AdminModeProviderInner>
    </Suspense>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
}
