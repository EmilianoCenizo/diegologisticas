'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Box,
  Typography,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton'; // ✅ nuevo
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ nuevo
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 🔸 Set displayName en el perfil de Firebase Auth
      await updateProfile(user, { displayName: name });
  
      // 🔸 Crear entrada en Firestore con más datos
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,   // usar displayName en vez de name
        role: "user",
        createdAt: new Date().toISOString(),
      });
        
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Crear cuenta
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Snackbar
        open={success}
        autoHideDuration={1500}
        message="Cuenta creada con éxito"
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} mt={2}>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            fullWidth
          />
          <TextField
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            fullWidth
          />
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={loading} // ✅ muestra spinner
          >
            Registrarse
          </LoadingButton>
        </Stack>
      </form>
    </Box>
  );
}
