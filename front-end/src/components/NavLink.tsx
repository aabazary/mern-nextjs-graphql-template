"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { NavLinkProps } from '@/types';

export default function NavLink({ href, children, authProtected = false, isAuthenticated = false }: NavLinkProps) {
  const pathname = usePathname();

  const isActive = (currentPath: string, linkHref: string) => {
    if (linkHref === "/login" && (currentPath === "/login" || currentPath === "/signup")) {
      return true;
    }
    return currentPath === linkHref;
  };

  const linkIsActive = isActive(pathname, href);

  const baseClasses = "text-lg px-4 py-2 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-[var(--color-primary)] text-[var(--color-text-button)]";
  const inactiveClasses = "bg-transparent text-[var(--color-text-navbar)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]";

  if (authProtected && !isAuthenticated) {
    return null;
  }
  if (href === "/login" && isAuthenticated) {
    return null;
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${linkIsActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </Link>
  );
}