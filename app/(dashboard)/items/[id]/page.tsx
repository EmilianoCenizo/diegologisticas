'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'
import ItemForm from '../../../components/ItemForm';

export default function EditItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    async function fetchItem() {
      const snap = await getDoc(doc(db, 'items', id as string));
      if (snap.exists()) {
        setItem({ id: snap.id, ...snap.data() });
      }
    }
    fetchItem();
  }, [id]);

  if (!item) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Editar ítem</h1>
      <ItemForm item={item} />
    </div>
  );
}
