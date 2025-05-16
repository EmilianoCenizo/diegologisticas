'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

import {
  Avatar,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function SidebarFooterAccount({ mini }: { mini: boolean }) {  
  const { user, loading } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleClose();
    } catch (error) {
      console.error('Error al desloguear:', error);
    }
  };
  
  if (loading || !user) return ("No user");
  

  const displayName = user.displayName || user.email || 'Usuario';

  return (
    <Stack direction="column" sx={{ width: '100%' }}>
      <Divider />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={mini ? 'center' : 'space-between'}
        spacing={1}
        p={1.5}
        sx={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <Avatar sx={{ width: 32, height: 32 }}>
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
        {!mini && (
          <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
            {displayName}
          </Typography>
        )}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 1,
              overflow: 'visible',
              filter: (theme) =>
                `drop-shadow(0px 2px 8px ${
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(0,0,0,0.32)'
                })`,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 10,
                left: 0,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
      </Menu>
    </Stack>
  );
}
