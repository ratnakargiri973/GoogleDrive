import React, { useContext, useEffect, useState } from 'react';
import home from '../assets/home.avif';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import 'react-toastify/dist/ReactToastify.css';
import { authContext } from './Context';

function Storage() {
    const { files, setFiles, searchQuery } = useContext(authContext);
    const [viewMode, setViewMode] = useState('list');
    const [totalSize, setTotalSize] = useState(0);
    const STORAGE_LIMIT = 100 * 1024 * 1024;

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "myfiles"), where("uid", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fileList = snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data(),
            }));

            setFiles(fileList);

            const totalStorageUsed = fileList.reduce((acc, file) => acc + (file.data.size || 0), 0);
            setTotalSize(totalStorageUsed);
        }, (error) => {
            console.error("Error fetching files:", error);
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

    const storagePercentage = (totalSize / STORAGE_LIMIT) * 100;

    const filteredFiles = files.filter(file =>
        file.data?.filename?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    return (
        <div className="flex-1 p-6 lg:p-10 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 min-h-screen">
            <header className="flex flex-col lg:flex-row justify-between items-center mb-8">
                <h1 className="font-bold text-4xl text-white">My Storage</h1>
                <div className="flex gap-6">
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-4 rounded-lg transition-all duration-300 transform ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                        <ViewListIcon style={{ fontSize: 28 }} />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`p-4 rounded-lg transition-all duration-300 transform ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                        <GridViewIcon style={{ fontSize: 28 }} />
                    </button>
                </div>
            </header>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-semibold mb-2">
                    Storage Used: {changeBytes(totalSize)} / {changeBytes(STORAGE_LIMIT)}
                </p>
                <div className="w-full bg-gray-300 rounded-lg h-4 overflow-hidden">
                    <div 
                        className="bg-blue-500 h-4 transition-all duration-300 ease-in-out" 
                        style={{ width: `${storagePercentage}%` }}></div>
                </div>
            </div>

            {filteredFiles.length === 0 ? (
                <div className="flex flex-col justify-center items-center gap-6 w-full text-center">
                    <img src={home} alt="No files" className="w-64 opacity-70 transform scale-105 transition-all duration-300" />
                    <h1 className="text-gray-900 text-3xl font-bold">No Files Available</h1>
                    <p className="text-gray-700 text-lg">It seems you haven't uploaded any files yet or all files are empty.</p>
                </div>
            ) : (
                viewMode === 'list' ? (
                    <div className="bg-white shadow-lg rounded-lg p-6 transition-all duration-300">
                        <div className="grid grid-cols-2 font-semibold text-gray-700 border-b pb-4">
                            <p>Name</p>
                            <p>Storage Used</p>
                        </div>
                        {filteredFiles.map(file => (
                            <div key={file.id} className="grid grid-cols-2 items-center p-4 mt-4 rounded-lg bg-white shadow-md hover:bg-blue-50 transition transform hover:scale-105">
                                <a 
                                    href={file.data.fileURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-3 text-blue-600 hover:underline">
                                    <InsertDriveFileIcon style={{ fontSize: 30 }} />
                                    {file.data.filename || "Unknown File"}
                                </a>
                                <p className="text-gray-600">{changeBytes(file.data.size)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredFiles.map(file => (
                            <div key={file.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                <a 
                                    href={file.data.fileURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex flex-col items-center">
                                    <InsertDriveFileIcon style={{ fontSize: 60 }} className="text-blue-500 transition-all duration-300" />
                                    <p className="mt-4 text-center text-gray-900 font-medium">{file.data.filename || "Unknown File"}</p>
                                    <p className="text-sm text-gray-600">{changeBytes(file.data.size)}</p>
                                </a>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default Storage;
