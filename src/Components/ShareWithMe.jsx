import React, { useContext, useEffect, useState } from 'react';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authContext } from './Context';

function ShareWithMe() {
    const { files, setFiles, searchQuery } = useContext(authContext);
    const [viewMode, setViewMode] = useState('list');

    const notifyCopy = () => toast.success("📋 URL copied to clipboard!");
    const notifyError = (message) => toast.error(`❌ ${message}`);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        async function fetchSharedFiles() {
            try {
                const q = query(collection(db, "myfiles"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fileList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data()
                }));
                setFiles(fileList);
            } catch (error) {
                console.error("Error fetching shared files:", error);
                notifyError("Failed to fetch shared files");
            }
        }
        fetchSharedFiles();
    }, [setFiles]);

    const handleCopy = async (fileURL) => {
        try {
            if (!fileURL) throw new Error("Invalid file URL");
            await navigator.clipboard.writeText(fileURL);
            notifyCopy();
        } catch (error) {
            console.error('Error copying URL:', error);
            notifyError('Failed to copy URL');
        }
    };

    const filteredFiles = files.filter(file =>
        file.data?.filename?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    return (
        <div className="flex-1 p-6 lg:p-10 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen">
            <header className="flex flex-col lg:flex-row justify-between items-center mb-6">
                <h1 className="font-extrabold text-4xl text-gray-900 drop-shadow-lg">📂 Shared with Me</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`p-3 rounded-lg shadow-md transition ${
                            viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    >
                        <ViewListIcon />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`p-3 rounded-lg shadow-md transition ${
                            viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    >
                        <GridViewIcon />
                    </button>
                </div>
            </header>

            {filteredFiles.length > 0 ? (
                viewMode === 'list' ? (
                    <div className="bg-white shadow-xl rounded-lg p-6">
                        <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-3">
                            <p>📄 Name</p>
                            <p>👤 Owner</p>
                            <p>📅 Shared Date</p>
                            <p>🔗 Actions</p>
                        </div>
                        {filteredFiles.map(file => (
                            <div key={file.id} className="grid grid-cols-4 items-center p-4 mt-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition shadow-sm">
                                <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" 
                                    className="flex items-center gap-2 text-blue-700 font-semibold hover:underline">
                                    <InsertDriveFileIcon /> {file.data?.filename || "Unknown File"}
                                </a>
                                <p className="text-gray-600">{file.data?.owner || "Unknown"}</p>
                                <p className="text-gray-600">{file.data?.timestamp?.seconds ? new Date(file.data.timestamp.seconds * 1000).toLocaleDateString() : "N/A"}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => handleCopy(file.data?.fileURL)} className="text-gray-600 hover:text-gray-900">
                                        <ContentCopyIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredFiles.map(file => (
                            <div key={file.id} className="bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
                                <a href={file.data?.fileURL || "#"} target="_blank" rel="noopener noreferrer" 
                                    className="flex flex-col items-center gap-2">
                                    <InsertDriveFileIcon style={{ fontSize: 50 }} className="text-blue-600" />
                                    <p className="text-lg font-semibold text-gray-900">{file.data?.filename || "Unknown File"}</p>
                                    <p className="text-sm text-gray-600">Shared by: {file.data?.owner || "Unknown"}</p>
                                    <p className="text-sm text-gray-600">{file.data?.timestamp?.seconds ? new Date(file.data.timestamp.seconds * 1000).toLocaleDateString() : "N/A"}</p>
                                </a>
                                <div className="mt-3 flex justify-center gap-4">
                                    <button onClick={() => handleCopy(file.data?.fileURL)} 
                                        className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition">
                                        <ContentCopyIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col justify-center items-center gap-4 w-full h-full text-center">
                    <h1 className="text-gray-900 text-2xl font-bold">🚀 No files shared with you yet!</h1>
                    <p className="text-gray-700">Once files are shared with you, they'll appear here.</p>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} pauseOnHover draggable theme="colored" />
        </div>
    );
}

export default ShareWithMe;
