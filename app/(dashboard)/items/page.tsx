'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Item = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  assignedTo?: string | null;
  pendingAssignment?: {
    userId: string;
    requestedAt: Timestamp | null;
  } | null;
};

type User = {
  id: string;
  displayName?: string;
  email: string;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { user, role } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(collection(db, 'items')),
        getDocs(collection(db, 'users')),
      ]);

      const itemsData: Item[] = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      const usersData: User[] = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      setItems(itemsData);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, 'items', deletingId));
      setDeletingId(null);
      fetchData();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('No se pudo eliminar el ítem');
    }
  };

  const handleAssign = async (itemId: string) => {
    const uid = selectedUser[itemId];
    try {
      // Crear o actualizar la asignación pendiente sin tocar assignedTo
      await updateDoc(doc(db, 'items', itemId), {
        pendingAssignment: uid
          ? { userId: uid, requestedAt: Timestamp.now() }
          : null,
      });
      fetchData();
    } catch (err) {
      console.error('Error al asignar usuario:', err);
      setError('Error al crear asignación pendiente');
    }
  };

  const isAdmin = role === 'admin';

  const canAssign = (item: Item) => {
    if (isAdmin) return true;
    return item.assignedTo === user?.uid;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Cargando items...</Typography>
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lista de Items
      </Typography>

      {isAdmin && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/items/new')}
          sx={{ mb: 2 }}
        >
          Agregar Item
        </Button>
      )}

      <Stack spacing={2}>
        {items.map((item) => {
          const currentAssignedUser = users.find((u) => u.id === item.assignedTo);
          const pendingUser = item.pendingAssignment
            ? users.find((u) => u.id === item.pendingAssignment!.userId)
            : null;

          // Control para deshabilitar botón:
          // No permite asignar si:
          // - no seleccionó usuario
          // - o la selección es igual a la asignación pendiente actual
          const disableAssignButton =
            !selectedUser[item.id] ||
            (item.pendingAssignment && selectedUser[item.id] === item.pendingAssignment.userId);

          return (
            <Paper
              key={item.id}
              sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.name}</Typography>
                {item.description && (
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Asignado a:{' '}
                  {currentAssignedUser
                    ? currentAssignedUser.displayName || currentAssignedUser.email
                    : 'Depósito'}
                </Typography>

                {item.pendingAssignment && pendingUser && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ mt: 0.5, fontStyle: 'italic' }}
                  >
                    Asignación pendiente a: {pendingUser.displayName || pendingUser.email} (
                    {item.pendingAssignment.requestedAt
                      ? item.pendingAssignment.requestedAt.toDate().toLocaleString()
                      : ''}
                    )
                  </Typography>
                )}

                {canAssign(item) && (
                  <Box
                    sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}
                  >
                    <FormControl size="small">
                      <InputLabel id={`select-label-${item.id}`}>Asignar a</InputLabel>
                      <Select
                        labelId={`select-label-${item.id}`}
                        value={selectedUser[item.id] || ''}
                        label="Asignar a"
                        onChange={(e) =>
                          setSelectedUser((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="">Depósito</MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.displayName || user.email}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="outlined"
                      onClick={() => handleAssign(item.id)}
                      disabled={disableAssignButton}
                    >
                      Asignar
                    </Button>
                  </Box>
                )}
              </Box>

              {isAdmin && (
                <>
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => router.push(`/items/edit/${item.id}`)}
                      aria-label={`Editar ${item.name}`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => setDeletingId(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Paper>
          );
        })}
      </Stack>

      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este ítem? Esta acción no se puede deshacer.
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
