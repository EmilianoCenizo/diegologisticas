'use client';

import * as React from 'react';
import { Account } from '@toolpad/core/Account';
import { signOut } from '../../lib/auth';
import { auth } from '../../lib/firebase';
import Typography from '@mui/material/Typography';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import DashboardContent from './DashboardContent';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export default function Dashboard() {
  return <DashboardContent />;}