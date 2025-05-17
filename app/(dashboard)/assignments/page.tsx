'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

type Item = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  assignedTo?: string | null;
  pendingAssignment?: {
    userId: string;
    requestedAt: any; // Timestamp de Firestore
  };
};

type User = {
  id: string;
  displayName?: string;
  email: string;
};

export default function AssignmentsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();
  const [openImage, setOpenImage] = useState<string | null>(null);

  const handleOpenImage = (url: string) => {
    setOpenImage(url);
  };
  const handleCloseImage = () => {
    setOpenImage(null);
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Traigo usuarios para mostrar nombres/emails
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: User[] = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);

      // Traigo items con filtro para no-admin
      let itemsSnapshot;
      if (role === 'admin') {
        itemsSnapshot = await getDocs(collection(db, 'items'));
      } else {
        // Filtro items donde user es asignado o receptor pendiente
        const q = query(
          collection(db, 'items'),
          // no hay índice compuesto para esto, habría que ajustar en Firestore
          // pero para simplificar traemos todos y filtramos en cliente
        );
        itemsSnapshot = await getDocs(collection(db, 'items'));
      }

      let itemsData: Item[] = itemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];

      if (role !== 'admin' && user) {
        itemsData = itemsData.filter(
          (item) =>
            item.assignedTo === user.uid ||
            item.pendingAssignment?.userId === user.uid
        );
      }

      setItems(itemsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const acceptAssignment = async (itemId: string) => {
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item || !item.pendingAssignment) return;

      await updateDoc(doc(db, 'items', itemId), {
        assignedTo: item.pendingAssignment.userId,
        pendingAssignment: null,
      });
      fetchData();
    } catch (err) {
      console.error('Error al aceptar asignación:', err);
    }
  };

  const rejectAssignment = async (itemId: string) => {
    try {
      await updateDoc(doc(db, 'items', itemId), {
        pendingAssignment: null,
      });
      fetchData();
    } catch (err) {
      console.error('Error al rechazar asignación:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Cargando asignaciones...</Typography>
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
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Asignaciones
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Asignado Actual</TableCell>
              <TableCell>Asignación Pendiente</TableCell>
              <TableCell>Solicitado En</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay asignaciones para mostrar
                </TableCell>
              </TableRow>
            )}

            {items.map((item) => {
              const assignedUser = users.find((u) => u.id === item.assignedTo);
              const pendingUser = item.pendingAssignment
                ? users.find((u) => u.id === item.pendingAssignment.userId)
                : null;

              const isReceiver = user?.uid === item.pendingAssignment?.userId;

              return (
                <TableRow key={item.id}>
                    <TableCell>
                    {item.imageUrl ? (
                        <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                            width: 50,
                            height: 50,
                            objectFit: 'cover',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                        onClick={() => handleOpenImage(item.imageUrl!)}
                        />
                    ) : (
                        '-'
                    )}
                    </TableCell>                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {assignedUser
                      ? assignedUser.displayName || assignedUser.email
                      : 'Depósito'}
                  </TableCell>
                  <TableCell>
                    {pendingUser
                      ? pendingUser.displayName || pendingUser.email
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.pendingAssignment?.requestedAt
                      ? item.pendingAssignment.requestedAt
                          .toDate()
                          .toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.pendingAssignment && isReceiver ? (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => acceptAssignment(item.id)}
                        >
                          Aceptar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => rejectAssignment(item.id)}
                        >
                          Rechazar
                        </Button>
                      </>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
            {/* Dialog para mostrar imagen grande */}
        <Dialog open={!!openImage} onClose={handleCloseImage} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
          {openImage && (
            <img
              src={openImage}
              alt="Imagen grande"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
            />
          )}
        </DialogContent>
      </Dialog>

    </Box>

    
  );
}
