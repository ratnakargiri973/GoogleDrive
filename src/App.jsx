import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './Components/Home';
import { authContext } from './Components/Context';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import { auth, provider, onAuthStateChanged } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import Login from './Components/Login';

function App() {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setPhotoURL(currentUser.photoURL);
      } else {
        setUser(null);
        setPhotoURL(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function signIn() {
    signInWithPopup(auth, provider)
      .then(({ user }) => {
        setUser(user);
        setPhotoURL(user.photoURL);
        navigate('/Home');
      })
      .catch((err) => alert(err.message));
  }

  function handleLogout() {
    signOut(auth)
      .then(() => {
        alert('You have been logged out.');
        navigate('/');
      })
      .catch((err) => alert(err.message));
  }

  function sortAscFilesByName() {
    setFiles(files => [...files].sort((a, b) => a.data.filename.localeCompare(b.data.filename)));
  }

  function sortDescFilesByName() {
    setFiles(files => [...files].sort((a, b) => b.data.filename.localeCompare(a.data.filename)));
  }

  function sortAscFilesByDate() {
    setFiles(files => [...files].sort((a, b) => new Date(a.data.timestamp.seconds * 1000) - new Date(b.data.timestamp.seconds * 1000)));
  }

  function sortDescFilesByDate() {
    setFiles(files => [...files].sort((a, b) => new Date(b.data.timestamp.seconds * 1000) - new Date(a.data.timestamp.seconds * 1000)));
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <authContext.Provider value={{ 
      files, 
      setFiles, 
      searchQuery, 
      setSearchQuery, 
      signIn, 
      photoURL, 
      handleLogout, 
      sortAscFilesByDate, 
      sortDescFilesByDate, 
      sortAscFilesByName, 
      sortDescFilesByName 
    }}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Home' element={
          <ProtectedRoute>
              <Home />
          </ProtectedRoute>
        } />
      </Routes>
    </authContext.Provider>
  );
}

export default App;
