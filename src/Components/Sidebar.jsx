import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ComputerIcon from '@mui/icons-material/Computer';
import ShareIcon from '@mui/icons-material/Share';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import { Modal } from '@mui/material';
import { db, storage, serverTimestamp, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function Sidebar() {
    const [open, setOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [usedStorage, setUsedStorage] = useState(0);
    const totalStorage = 100 * 1024 * 1024;

    const location = useLocation();
    const user = auth.currentUser;

    useEffect(() => {
        async function fetchFiles() {
            const querySnapshot = await getDocs(collection(db, "myfiles"));
            let totalSize = 0;
            querySnapshot.forEach(doc => {
                totalSize += doc.data().size;
            });
            setUsedStorage(totalSize);
        }
        fetchFiles();
    }, []);

    function handleFile(e) {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !user) {
            alert("Please select a file and make sure you're logged in.");
            return;
        }

        setUploading(true);

        try {
            const fileRef = ref(storage, `files/${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            await addDoc(collection(db, "myfiles"), {
                timestamp: serverTimestamp(),
                filename: file.name,
                fileURL: url,
                size: snapshot.metadata.size,
                uid: user.uid,
                owner: user.email
            });

            setUsedStorage(prevUsedStorage => prevUsedStorage + snapshot.metadata.size);

            setUploading(false);
            setFile(null);
            setOpen(false);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file: " + error.message);
            setUploading(false);
        }
    };

    const usedPercentage = (usedStorage / totalStorage) * 100;

    return (
        <>
            <Modal open={open} onClose={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className='m-auto w-80 sm:w-96 h-40 rounded-lg bg-teal-600 p-5 shadow-lg'>
                    <form onSubmit={handleUpload} className='flex flex-col items-center gap-4 text-white'>
                        <h3 className='font-bold text-lg'>Select the file to upload</h3>
                        <div>
                            {uploading ? (
                                <h3 className="text-center text-lg font-semibold">Uploading...</h3>
                            ) : (
                                <div className='flex flex-col gap-3'>
                                    <input type="file" className='text-sm' onChange={handleFile} />
                                    <button type="submit" className='bg-red-500 px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition'>
                                        Upload
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </Modal>

            <div className='flex flex-col justify-between p-6 w-full sm:w-1/4 lg:w-1/5 h-full bg-white shadow-lg rounded-r-2xl'>
                <button
                    className='flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition w-full'
                    onClick={() => setOpen(true)}
                >
                    <AddIcon />
                    <span className='hidden sm:block font-semibold'>New</span>
                </button>

                <ul className='mt-6 flex flex-col gap-2'>
                    {[
                        { to: '/', icon: <HomeOutlinedIcon />, label: 'Home' },
                        { to: '/my-drive', icon: <DriveFolderUploadIcon />, label: 'My Drive' },
                        { to: '/computers', icon: <ComputerIcon />, label: 'Computers' },
                        { to: '/share-me', icon: <ShareIcon />, label: 'Shared with me' },
                        { to: '/recent', icon: <ScheduleIcon />, label: 'Recent' },
                        { to: '/starred', icon: <StarBorderIcon />, label: 'Starred' },
                        { to: '/spam', icon: <ErrorOutlineIcon />, label: 'Spam' },
                        { to: '/trash', icon: <DeleteIcon />, label: 'Trash' },
                        { to: '/storage', icon: <CloudOutlinedIcon />, label: 'Storage' }
                    ].map(({ to, icon, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 p-3 rounded-lg transition text-gray-700 hover:bg-blue-100 hover:text-blue-800 ${
                                location.pathname === to ? 'bg-blue-500 text-white' : ''
                            }`}
                        >
                            {icon} {label}
                        </Link>
                    ))}
                </ul>

               
                <div className='mt-6'>
                    <div className='h-2 rounded-3xl bg-gray-300 w-full overflow-hidden'>
                        <div className='bg-gradient-to-r from-green-400 to-green-600 h-full rounded-3xl' style={{ width: `${usedPercentage}%` }}></div>
                    </div>
                    <span className='text-sm font-semibold text-gray-600 block mt-2'>
                        {(usedStorage / 1024 / 1024).toFixed(2)} MB of 100 MB used
                    </span>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
