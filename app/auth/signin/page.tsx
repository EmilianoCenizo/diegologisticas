'use client';

import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import { AppProvider } from '@toolpad/core/AppProvider';
import { signIn } from '../../../lib/auth';
import { auth } from '../../../lib/firebase';
import { createTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

const providers = [
  { id: 'credentials', name: 'Email y Contraseña' },
];

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
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: '1rem',
        },
      },
    },
  },
});

const BRANDING = {
  logo: <img src="/logo.png" alt="Logo" style={{ height: 24 }} />,
  title: 'Mi Aplicación',
};

export default function SignIn() {
  const [error, setError] = React.useState(null);
  const router = useRouter();

  const goToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <AppProvider branding={BRANDING} theme={theme}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <SignInPage
        signIn={async (provider, formData) => {
          setError(null);
          console.log('signIn called with provider:', provider.id, 'at:', new Date().toISOString());
          console.log('FormData entries:', Object.fromEntries(formData));
          try {
            const result = await signIn(provider.id, formData);
            console.log('signIn result:', result, 'at:', new Date().toISOString());
            if (result.error) {
              console.log('signIn failed with error:', result.error);
              setError(result.error);
              return;
            }
            // Verificar usuario con onAuthStateChanged
            const user = await new Promise((resolve, reject) => {
              console.log('Checking auth state post-signIn at:', new Date().toISOString());
              const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                console.log('Post-signIn onAuthStateChanged:', user ? user.uid : null);
                if (user) {
                  resolve(user);
                } else {
                  reject(new Error('No user authenticated after sign-in'));
                }
              }, (error) => {
                console.error('Post-signIn auth error:', error);
                reject(error);
              });
            });

            console.log('User confirmed after sign-in:', user.uid, 'at:', new Date().toISOString());
            // Retraso adicional para asegurar sincronización
            console.log('Waiting for auth state to settle');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log('Redirecting to / at:', new Date().toISOString());
            router.push('/');
          } catch (err) {
            console.error('Error during sign-in:', err.message, 'at:', new Date().toISOString());
            setError(err.message);
          }
        }}
        providers={providers}
        slotProps={{
          emailField: { autoFocus: false },
          form: { noValidate: true },
        }}
      />
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
    ¿No tenés cuenta?{' '}
    <Button variant="text" color="primary" onClick={() => router.push('/auth/signup')}>
      Registrate acá
    </Button>
  </div>
    </AppProvider>
  );
}