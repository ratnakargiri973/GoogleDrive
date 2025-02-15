import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './Components/Home';
import { authContext } from './Components/Context';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import { auth, provider, onAuthStateChanged } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import Login from './Components/Login';
import MyDrive from './Components/MyDrive';
import Sidebar from './Components/Sidebar';
import Header from './Components/Header';
import Computers from './Components/Computers';
import ShareWithMe from './Components/ShareWithMe';
import Recent from './Components/Recent';
import Starred from './Components/Starred';
import Spam from './Components/Spam';
import Trash from './Components/Trash';
import Storage from './Components/Storage';

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
        navigate('/');
      })
      .catch((err) => alert(err.message));
  }

  function handleLogout() {
    signOut(auth)
      .then(() => {
        alert('You have been logged out.');
        navigate('/login');
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
      
      <div className='flex flex-col lg:flex-row'>
        <ProtectedRoute>
        <Header />
        <Sidebar className='lg:w-1/5' />
        </ProtectedRoute>
      
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={
          <ProtectedRoute>
              <Home />
          </ProtectedRoute>
        } />
        <Route path='/my-drive' element={
          <ProtectedRoute>
              <MyDrive />
          </ProtectedRoute>
        } />
      <Route path='/computers' element={
          <ProtectedRoute>
              <Computers />
          </ProtectedRoute>
        } />
        <Route path='/share-me' element={
          <ProtectedRoute>
              <ShareWithMe />
          </ProtectedRoute>
        } />
        <Route path='/recent' element={
          <ProtectedRoute>
              <Recent />
          </ProtectedRoute>
        } />
        <Route path='/starred' element={
          <ProtectedRoute>
              <Starred />
          </ProtectedRoute>
        } />
        <Route path='/spam' element={
          <ProtectedRoute>
              <Spam />
          </ProtectedRoute>
        } />
        <Route path='/trash' element={
          <ProtectedRoute>
              <Trash />
          </ProtectedRoute>
        } />
        <Route path='/storage' element={
          <ProtectedRoute>
              <Storage />
          </ProtectedRoute>
        } />

      </Routes>
      </div>
    </authContext.Provider>
  );
}

export default App;
