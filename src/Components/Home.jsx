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
import Header from './Header';
import Sidebar from './Sidebar';

function Home() {
    const { files, setFiles, searchQuery } = useContext(authContext);
   
    const [viewMode, setViewMode] = useState('list'); // Default view mode
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
            
            // setFiles(files.filter(file => file.id !== fileId));
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
            <Header />
            <div className='flex'>
                <Sidebar />
                <div className='p-8 w-full flex flex-col justify-start items-start'>
                    <div className='flex justify-between items-center w-full'>
                        <h1 className='font-semibold text-3xl'>Home</h1>
                        <div className='flex gap-4 mb-4'>
                            <button onClick={() => setViewMode('list')} className='p-2'>
                                <ViewListIcon className={viewMode === 'list' ? 'text-blue-500' : ''} />
                            </button>
                            <button onClick={() => setViewMode('grid')} className='p-2'>
                                <GridViewIcon className={viewMode === 'grid' ? 'text-blue-500' : ''} />
                            </button>
                        </div>
                    </div>
                    
                    {filteredFiles.length > 0 ? (
                        viewMode === 'list' ? (
                            <>
                                <div className='flex justify-between items-center pt-16 w-full mb-2'>
                                    <p className='pl-8'><b>Name</b></p>
                                    <p className='pl-8'><b>Last Modified</b></p>
                                    <p className='pl-24'><b>File Size</b></p>
                                    <p><b>Actions</b></p>
                                </div>
                                {filteredFiles.map(file => (
                                    <div key={file.id} className='flex justify-between items-center w-full py-2 bg-green-600 p-2 rounded-3xl mb-2 hover:bg-teal-300'>
                                        <a href={file.data.fileURL} target='_blank' rel='noopener noreferrer'>
                                            <p className='flex items-center gap-2'><InsertDriveFileIcon />{file.data.filename}</p>
                                        </a>
                                        <p>{new Date(file.data.timestamp?.seconds * 1000).toUTCString()}</p>
                                        <p>{changeBytes(file.data.size)}</p>
                                        <div>
                                            <button onClick={() => handleCopy(file.data.fileURL)}><ContentCopyIcon /></button>
                                            <button onClick={() => handleDelete(file.id, file.data.fileURL)}>
                                                <DeleteIcon className="text-red-600 cursor-pointer" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                                {filteredFiles.map(file => (
                                    <div key={file.id} className='bg-green-500 p-4 rounded-3xl hover:bg-teal-300'>
                                        <a href={file.data.fileURL} target='_blank' rel='noopener noreferrer' className='flex flex-col items-center'>
                                            <InsertDriveFileIcon style={{ fontSize: 48 }} />
                                            <p className='mt-2 text-center'>{file.data.filename}</p>
                                            <p>{new Date(file.data.timestamp?.seconds * 1000).toUTCString()}</p>
                                            <p>{changeBytes(file.data.size)}</p>
                                        </a>
                                        <div className='mt-2 flex justify-center gap-2'>
                                            <button onClick={() => handleCopy(file.data.fileURL)}><ContentCopyIcon /></button>
                                            <button onClick={() => handleDelete(file.id, file.data.fileURL)}>
                                                <DeleteIcon className="text-red-600 cursor-pointer" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className='flex flex-col justify-center items-center gap-2 w-full h-full'>
                            <img src={home} alt="home" className='w-96' />
                            <h1 className='text-slate-950 text-2xl'>Welcome to Drive, the home for all your files</h1>
                            <p>Use the “New” button to upload</p>
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
            </div>
        </>
    );
}

export default Home;
