'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../lib/firebase';
import { useRouter } from 'next/navigation';
import ItemForm from '../../../components/ItemForm';

export default function NewItemPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async ({ name, description, imageFile }: { name: string; description: string; imageFile: File | null }) => {
    setLoading(true);
    let imageUrl = '';
    if (imageFile) {
      const imageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    await addDoc(collection(db, 'items'), { name, description, imageUrl });
    setLoading(false);
    router.push('/items');
  };

  return <ItemForm onSubmit={handleCreate} isLoading={loading} />;
}
