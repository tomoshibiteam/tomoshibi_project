import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

for (const [k,v] of Object.entries(config)) {
  if (!v) throw new Error(`missing ${k}`);
}

const app = initializeApp(config);
const db = getFirestore(app);
const ref = doc(db, 'spots', '__codex_write_test__');
await setDoc(ref, {
  nameJa: 'test',
  slug: '__codex_write_test__',
  status: 'draft',
  createdAt: new Date().toISOString(),
});
await deleteDoc(ref);
console.log('client write ok');
