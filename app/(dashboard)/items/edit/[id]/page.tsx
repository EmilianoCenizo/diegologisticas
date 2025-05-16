'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../../lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import ItemForm from '../../../../components/ItemForm';

export default function EditItemPage() {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemData, setItemData] = useState<{ name: string; description: string; imageUrl: string }>({
    name: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!id) return;

    async function fetchItem() {
      setLoading(true);
      const docRef = doc(db, 'items', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setItemData({
          name: data.name || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });
      }
      setLoading(false);
    }

    fetchItem();
  }, [id]);

  const handleUpdate = async ({ name, description, imageFile }: { name: string; description: string; imageFile: File | null }) => {
    if (!id) return;
    setSaving(true);

    let imageUrl = itemData.imageUrl;
    if (imageFile) {
      const imageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const docRef = doc(db, 'items', id);
    await updateDoc(docRef, { name, description, imageUrl });

    setSaving(false);
    router.push('/items');
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <ItemForm
      initialName={itemData.name}
      initialDescription={itemData.description}
      initialImageUrl={itemData.imageUrl}
      onSubmit={handleUpdate}
      isLoading={saving}
    />
  );
}
