'use client';
import { useState, useEffect } from 'react';
import { TextField, Stack, Typography, Box, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface ItemFormProps {
  initialName?: string;
  initialDescription?: string;
  initialImageUrl?: string;
  onSubmit: (data: { name: string; description: string; imageFile: File | null }) => Promise<void>;
  isLoading?: boolean;
}

export default function ItemForm({
  initialName = '',
  initialDescription = '',
  initialImageUrl = '',
  onSubmit,
  isLoading = false,
}: ItemFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setImagePreview(initialImageUrl || null);
    setImageFile(null);
  }, [initialName, initialDescription, initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(initialImageUrl || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit({ name, description, imageFile });
      setSuccess(true);
      // Opcional: resetear campos solo si estás en modo creación
      // setName('');
      // setDescription('');
      // setImageFile(null);
      // setImagePreview(null);
    } catch (err: any) {
      setError(err?.message || 'Error desconocido');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Snackbar
        open={success}
        autoHideDuration={1500}
        message="Operación exitosa"
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">{initialName ? 'Editar ítem' : 'Crear nuevo ítem'}</Typography>
          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            disabled={isLoading}
          />
          <LoadingButton
            variant="contained"
            component="label"
            loading={isLoading}
            disabled={isLoading}
          >
            Seleccionar imagen
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </LoadingButton>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Vista previa"
              style={{
                maxWidth: '100%',
                maxHeight: 300,
                height: 'auto',
                width: 'auto',
                objectFit: 'contain',
                borderRadius: 8,
                display: 'block',
                margin: '0 auto',
              }}
            />
          )}
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {initialName ? 'Guardar cambios' : 'Crear ítem'}
          </LoadingButton>
        </Stack>
      </form>
    </Box>
  );
}
