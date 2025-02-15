
import React, { useContext, useEffect, useState } from 'react';
import home from '../assets/home.avif';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { db, storage, auth } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authContext } from './Context';



function Home() {
    const { files, setFiles, searchQuery } = useContext(authContext);
   
    const [viewMode, setViewMode] = useState('list');
    const notify1 = () => toast("File is successfully deleted");
    const notify2 = () => toast("URL is copied to clipboard!!");

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const filesCollection = collection(db, "myfiles");
            const q = query(filesCollection, where("uid", "==", user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setFiles(snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                })));
            }, (error) => {
                console.error("Error fetching files:", error); 
            });

            return () => unsubscribe();
        }
    }, [setFiles]);

    const changeBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleDelete = async (fileId, fileURL) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this file?");
        if (!confirmDelete) return;

        try {
            const fileRef = ref(storage, fileURL);
            await deleteObject(fileRef);

            await deleteDoc(doc(db, "myfiles", fileId));
            notify1();
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Error deleting file: " + error.message);
        }
    };

    const handleCopy = async (fileURL) => {
        try {
            await navigator.clipboard.writeText(fileURL);
            notify2();
        } catch (error) {
            console.error('Error copying URL:', error);
            alert('Failed to copy URL: ' + error.message);
        }
    };

    const filteredFiles = files.filter(file =>
        file.data.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="flex-1 p-6 lg:p-10">
            <header className="flex flex-col lg:flex-row justify-between items-center mb-6">
                <h1 className="font-bold text-3xl text-gray-900">Home</h1>
                <div className="flex gap-4">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        <ViewListIcon />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        <GridViewIcon />
                    </button>
                </div>
            </header>
            
            {filteredFiles.length > 0 ? (
                viewMode === 'list' ? (
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2">
                            <p>Name</p>
                            <p>Last Modified</p>
                            <p>File Size</p>
                            <p>Actions</p>
                        </div>
                        {filteredFiles.map(file => (
                            <div key={file.id} className="grid grid-cols-4 items-center p-3 mt-2 rounded-lg bg-green-100 hover:bg-green-200 transition">
                                <a href={file.data.fileURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <InsertDriveFileIcon /> {file.data.filename}
                                </a>
                                <p>{new Date(file.data.timestamp?.seconds * 1000).toUTCString()}</p>
                                <p>{changeBytes(file.data.size)}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleCopy(file.data.fileURL)} className="text-gray-600 hover:text-gray-900">
                                        <ContentCopyIcon />
                                    </button>
                                    <button onClick={() => handleDelete(file.id, file.data.fileURL)} className="text-red-500 hover:text-red-700">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredFiles.map(file => (
                            <div key={file.id} className="bg-green-100 p-4 rounded-lg shadow-md hover:bg-green-200 transition">
                                <a href={file.data.fileURL} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                                    <InsertDriveFileIcon style={{ fontSize: 48 }} className="text-gray-700" />
                                    <p className="mt-2 text-center text-gray-900 font-medium">{file.data.filename}</p>
                                    <p className="text-sm text-gray-700">{new Date(file.data.timestamp?.seconds * 1000).toUTCString()}</p>
                                    <p className="text-sm text-gray-700">{changeBytes(file.data.size)}</p>
                                </a>
                                <div className="mt-2 flex justify-center gap-2">
                                    <button onClick={() => handleCopy(file.data.fileURL)} className="text-gray-600 hover:text-gray-900">
                                        <ContentCopyIcon />
                                    </button>
                                    <button onClick={() => handleDelete(file.id, file.data.fileURL)} className="text-red-500 hover:text-red-700">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col justify-center items-center gap-4 w-full h-full text-center">
                    <img src={home} alt="home" className="w-80" />
                    <h1 className="text-gray-900 text-2xl font-bold">Welcome to Drive, the home for all your files</h1>
                    <p className="text-gray-700">Use the “New” button to upload</p>
                </div>
            )}
            
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
        </>
    );
}

export default Home;
