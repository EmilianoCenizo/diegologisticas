'use client'
import * as React from 'react'; // Agrega esta línea
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import { auth } from '../lib/firebase';
import { useEffect, useState } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { AuthProvider } from './context/AuthContext';
import HeadphonesIcon from '@mui/icons-material/Headphones';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'orders',
    title: 'Orders',
    icon: <ShoppingCartIcon />,
  },
  {
    segment: 'items',
    title: 'Items',
    icon: <HeadphonesIcon />,
  },
  {
    segment: 'users',
    title: 'Usuarios',
    icon: <PersonIcon />,
    pattern: 'employees{/:employeeId}*',
  },
];

const BRANDING = {
  title: 'Mi Aplicación',
};

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body>
        <React.Suspense fallback={<LinearProgress />}>
          <NextAppProvider navigation={NAVIGATION} branding={BRANDING} user={user}> 
          <AuthProvider>
            {children}
            </AuthProvider>
          </NextAppProvider>
        </React.Suspense>
      </body>
    </html>
  );
}