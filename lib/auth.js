import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export async function signIn(providerId, data) {
  console.log('signIn called with providerId:', providerId, 'data:', data);
  try {
    if (providerId === 'credentials') {
      const email = data.get('email');
      const password = data.get('password');
      
      if (!email || !password) {
        throw new Error('Faltan email o contraseña');
      }

      console.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('signIn successful, user:', userCredential.user.uid);
      return { user: userCredential.user };
    } else if (providerId === 'google') {
      const userCredential = await signInWithPopup(auth, googleProvider);
      console.log('signIn with Google successful, user:', userCredential.user.uid);
      return { user: userCredential.user };
    }
    throw new Error('Proveedor no soportado');
  } catch (error) {
    console.error('Error en signIn:', error);
    if (error.code === 'auth/invalid-credential') {
      return { error: 'Correo o contraseña incorrectos' };
    } else if (error.code === 'auth/user-not-found') {
      return { error: 'Usuario no encontrado' };
    } else if (error.code === 'auth/wrong-password') {
      return { error: 'Contraseña incorrecta' };
    }
    return { error: error.message || 'Error al iniciar sesión' };
  }
}

export async function signOut() {
  console.log('signOut called');
  await firebaseSignOut(auth);
  console.log('signOut successful');
}

export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    console.log('getCurrentUser called at:', new Date().toISOString());
    let attempts = 0;
    const maxAttempts = 3;
    const interval = 1000;

    const checkAuthState = () => {
      console.log(`getCurrentUser attempt ${attempts + 1} at:`, new Date().toISOString());
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        attempts++;
        console.log(`getCurrentUser attempt ${attempts} result:`, user ? user.uid : null);

        if (user) {
          console.log('getCurrentUser resolved with user:', user.uid);
          resolve(user);
        } else if (attempts >= maxAttempts) {
          console.log('getCurrentUser max attempts reached, resolving with null');
          resolve(null);
        } else {
          setTimeout(checkAuthState, interval);
        }
      }, (error) => {
        console.error('getCurrentUser error:', error);
        reject(error);
      });
    };

    checkAuthState();
  });
}