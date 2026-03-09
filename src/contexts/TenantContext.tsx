'use client';

import { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import type { Organization, Admin } from '@/types';
import {
  generateThemeCssVariables,
  getTextColorForBackground,
  DEFAULT_THEME,
  type ThemeColors,
} from '@/lib/organization/theming';

interface TenantContextValue {
  organization: Organization;
  admin: Admin | null;
  isSuperAdmin: boolean;
  theme: ThemeColors;
  removeBranding: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  children: ReactNode;
  organization: Organization;
  admin?: Admin | null;
  isSuperAdmin?: boolean;
}

export function TenantProvider({
  children,
  organization,
  admin = null,
  isSuperAdmin = false
}: TenantProviderProps) {
  // Memoize theme to avoid recalculation
  const theme: ThemeColors = useMemo(() => ({
    primary: organization.primary_color || DEFAULT_THEME.primary,
    secondary: organization.secondary_color || DEFAULT_THEME.secondary,
    primaryForeground: getTextColorForBackground(organization.primary_color || DEFAULT_THEME.primary),
    secondaryForeground: getTextColorForBackground(organization.secondary_color || DEFAULT_THEME.secondary),
  }), [organization.primary_color, organization.secondary_color]);

  // Check if branding should be removed (enterprise feature)
  const removeBranding = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = organization as any;
    return org.remove_branding === true && organization.plan_type === 'enterprise';
  }, [organization]);

  // Inject CSS variables into document root
  useEffect(() => {
    const cssVariables = generateThemeCssVariables(theme);
    const root = document.documentElement;

    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Cleanup on unmount
    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [theme]);

  const value = useMemo(() => ({
    organization,
    admin,
    isSuperAdmin,
    theme,
    removeBranding,
  }), [organization, admin, isSuperAdmin, theme, removeBranding]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext);
}
