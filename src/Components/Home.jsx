import React, { useContext, useEffect, useState } from 'react';
import home from '../assets/home.avif';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import HomeIcon from '@mui/icons-material/Home';
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

    const notifySuccess = (message) => toast.success(`✅ ${message}`);
    const notifyError = (message) => toast.error(`❌ ${message}`);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "myfiles"), where("uid", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFiles(snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
        }, (error) => {
            console.error("Error fetching files:", error);
            notifyError("Failed to fetch files");
        });

        return () => unsubscribe();
    }, [setFiles]);

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.seconds) return "N/A";
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    const handleDelete = async (fileId, fileURL) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            if (!fileURL) throw new Error("Invalid file URL");
            await deleteObject(ref(storage, fileURL));
            await deleteDoc(doc(db, "myfiles", fileId));
            notifySuccess("File successfully deleted");
        } catch (error) {
            console.error("Error deleting file:", error);
            notifyError("Error deleting file");
        }
    };

    const handleCopy = async (fileURL) => {
        try {
            if (!fileURL) throw new Error("Invalid file URL");
            await navigator.clipboard.writeText(fileURL);
            notifySuccess("URL copied to clipboard!");
        } catch (error) {
            console.error('Error copying URL:', error);
            notifyError('Failed to copy URL');
        }
    };

    const filteredFiles = files.filter(file =>
        file.data?.filename?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    return (
        <div className="flex-1 p-6 lg:p-10 bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen">
            <header className="flex flex-col lg:flex-row justify-between items-center mb-6">
            <h1 className="font-extrabold text-4xl text-gray-900 flex items-center gap-2">
                 <HomeIcon className="text-blue-500 text-7xl" /> Home
           </h1>
                <div className="flex gap-4">
                    <button onClick={() => setViewMode('list')} className={`p-3 rounded-lg shadow-md transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}>
                        <ViewListIcon />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-3 rounded-lg shadow-md transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}>
                        <GridViewIcon />
                    </button>
                </div>
            </header>

            {filteredFiles.length > 0 ? (
                viewMode === 'list' ? (
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-3">
                            <p>📄 Name</p>
                            <p>📅 Last Modified</p>
                            <p>📂 File Size</p>
                            <p>🔗 Actions</p>
                        </div>
                        {filteredFiles.map(file => (
                            <div key={file.id} className="grid grid-cols-4 items-center p-4 mt-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition shadow-sm">
                                <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-700 font-semibold hover:underline">
                                    <InsertDriveFileIcon /> {file.data?.filename || "Unknown File"}
                                </a>
                                <p>{formatDate(file.data?.timestamp)}</p>
                                <p>{formatBytes(file.data?.size)}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleCopy(file.data?.fileURL)} className="text-gray-600 hover:text-gray-900">
                                        <ContentCopyIcon />
                                    </button>
                                    <button onClick={() => handleDelete(file.id, file.data?.fileURL)} className="text-red-500 hover:text-red-700">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredFiles.map(file => (
                            <div key={file.id} className="bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
                                <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
                                    <InsertDriveFileIcon style={{ fontSize: 50 }} className="text-blue-600" />
                                    <p className="text-lg font-semibold text-gray-900">{file.data?.filename || "Unknown File"}</p>
                                </a>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center">
                    <img src={home} alt="home" className="w-80 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-900 mt-4">Welcome to Home</h2>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
}

export default Home;
