"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ClientLayout } from './ClientLayout';
import { getSession } from '@/lib/auth'; // Wait, getSession in Client Component? No.

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
