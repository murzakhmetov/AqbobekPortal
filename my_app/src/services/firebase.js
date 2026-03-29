import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, push, update, onValue, remove } from 'firebase/database';

const firebaseConfig = {
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, push, update, onValue, remove };
export default app;
