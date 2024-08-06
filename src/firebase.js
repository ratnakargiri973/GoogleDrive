import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider ,onAuthStateChanged, setPersistence, browserLocalPersistence} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBTRrAPQiDrSov1m9x4hmRGsTgj0i17Lbo",
    authDomain: "drive-6ba6f.firebaseapp.com",
    projectId: "drive-6ba6f",
    storageBucket: "drive-6ba6f.appspot.com",
    messagingSenderId: "427572383798",
    appId: "1:427572383798:web:f3dbaa89577fb70ef88897"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
setPersistence(auth, browserLocalPersistence);

export { app, db, storage, auth, provider, serverTimestamp, ref, uploadBytes, getDownloadURL ,onAuthStateChanged};
