'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type User = {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'users', deletingId));
      setDeletingId(null);
      fetchUsers(); // Refrescar lista
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('No se pudo eliminar el usuario');
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>No hay usuarios para mostrar.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Usuarios
      </Typography>
      <Stack spacing={2}>
        {users.map(({ id, email, displayName, role }) => (
          <Paper key={id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{displayName || 'Sin nombre'}</Typography>
              <Typography variant="body2">{email}</Typography>
              {role && (
                <Typography variant="caption" color="text.secondary">
                  Rol: {role}
                </Typography>
              )}
            </Box>
            <Tooltip title="Eliminar">
              <IconButton
                color="error"
                onClick={() => setDeletingId(id)}
                aria-label={`Eliminar ${email}`}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        ))}
      </Stack>

      {/* Dialogo confirmación eliminar */}
      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingId(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete} autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
