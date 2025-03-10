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

function MyDrive() {
    const { files, setFiles, searchQuery } = useContext(authContext);
    const [viewMode, setViewMode] = useState('list');

    const notify1 = () => toast.success("✅ File is successfully deleted");
    const notify2 = () => toast.success("📋 URL is copied to clipboard!");
    const notifyError = (message) => toast.error(`❌ ${message}`);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const filesCollection = collection(db, "myfiles");
        const q = query(filesCollection, where("uid", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setFiles(snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        }, (error) => {
            console.error("Error fetching files:", error);
            notifyError("Failed to fetch files");
        });

        return () => unsubscribe();
    }, [setFiles]);

    const changeBytes = (bytes, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.seconds) return "N/A";
        return new Date(timestamp.seconds * 1000).toUTCString();
    };

    const handleDelete = async (fileId, fileURL) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this file?");
        if (!confirmDelete) return;

        try {
            if (!fileURL) throw new Error("Invalid file URL");

            const fileRef = ref(storage, fileURL);
            await deleteObject(fileRef);

            await deleteDoc(doc(db, "myfiles", fileId));
            notify1();
        } catch (error) {
            console.error("Error deleting file:", error);
            notifyError("Error deleting file: " + error.message);
        }
    };

    const handleCopy = async (fileURL) => {
        try {
            if (!fileURL) throw new Error("Invalid file URL");
            await navigator.clipboard.writeText(fileURL);
            notify2();
        } catch (error) {
            console.error('Error copying URL:', error);
            notifyError('Failed to copy URL');
        }
    };

    const filteredFiles = files.filter(file =>
        file.data?.filename?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    return (
        <>
            <div className="flex-1 p-6 lg:p-10">
                <header className="flex flex-col lg:flex-row justify-between items-center mb-6">
                    <h1 className="font-bold text-3xl">My Drive</h1>
                    <div className="flex gap-4">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}>
                            <ViewListIcon />
                        </button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'}`}>
                            <GridViewIcon />
                        </button>
                    </div>
                </header>

                {filteredFiles.length > 0 ? (
                    viewMode === 'list' ? (
                        <div className="bg-white shadow-lg rounded-lg p-4">
                            <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2">
                                <p>Name</p>
                                <p>Last Modified</p>
                                <p>File Size</p>
                                <p>Actions</p>
                            </div>
                            {filteredFiles.map(file => (
                                <div key={file.id} className="grid grid-cols-4 items-center p-3 mt-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                                    <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                        <InsertDriveFileIcon /> {file.data?.filename || "Unknown File"}
                                    </a>
                                    <p className='text-gray-900'>{formatDate(file.data?.timestamp)}</p>
                                    <p className='text-gray-900'>{changeBytes(file.data?.size)}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleCopy(file.data?.fileURL)} className="text-gray-600 hover:text-gray-900 transition-all">
                                            <ContentCopyIcon />
                                        </button>
                                        <button onClick={() => handleDelete(file.id, file.data?.fileURL)} className="text-red-500 hover:text-red-700 transition-all">
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredFiles.map(file => (
                                <div key={file.id} className="bg-blue-50 p-4 rounded-lg shadow-md hover:bg-blue-100 transition-all duration-300">
                                    <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                                        <InsertDriveFileIcon style={{ fontSize: 48 }} className="text-gray-700" />
                                        <p className="mt-2 text-center text-gray-900 font-medium">{file.data?.filename || "Unknown File"}</p>
                                        <p className="text-sm text-gray-700">{formatDate(file.data?.timestamp)}</p>
                                        <p className="text-sm text-gray-700">{changeBytes(file.data?.size)}</p>
                                    </a>
                                    <div className="mt-2 flex justify-center gap-2">
                                        <button onClick={() => handleCopy(file.data?.fileURL)} className="text-gray-600 hover:text-gray-900 transition-all">
                                            <ContentCopyIcon />
                                        </button>
                                        <button onClick={() => handleDelete(file.id, file.data?.fileURL)} className="text-red-500 hover:text-red-700 transition-all">
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col justify-center items-center gap-4 w-full h-full text-center">
                        <img src={home} alt="home" className="w-80 opacity-90" />
                        <h1 className="text-gray-900 text-2xl font-bold">Welcome to Drive, your cloud storage</h1>
                        <p className="text-gray-700">Click "New" to upload files</p>
                    </div>
                )}

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} pauseOnHover draggable theme="light" />
            </div>
        </>
    );
}

export default MyDrive;
