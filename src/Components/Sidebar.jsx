import React, { useEffect, useState } from 'react';
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
    const totalStorage = 100 * 1024 * 1024; // 100 MB in bytes

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
            // Upload file
            const fileRef = ref(storage, `files/${file.name}`);
            const snapshot = await uploadBytes(fileRef, file);

            // Get file URL
            const url = await getDownloadURL(fileRef);

            // Add file information to Firestore
            await addDoc(collection(db, "myfiles"), {
                timestamp: serverTimestamp(),
                filename: file.name,
                fileURL: url,
                size: snapshot.metadata.size,
                uid: user.uid // Store the user's UID with the file
            });

            // Update used storage
            setUsedStorage(prevUsedStorage => prevUsedStorage + snapshot.metadata.size);

            // Reset states
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
            <Modal open={open} onClose={() => setOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className='m-auto w-80 sm:w-96 h-36 rounded bg-teal-500 p-4'>
                    <form onSubmit={handleUpload} className='flex justify-center items-center flex-col w-full h-full gap-4 text-white'>
                        <h3 className='font-bold text-lg'>Select the file you want to upload</h3>
                        <div>
                            {uploading ? <h3>Uploading...</h3> :
                                (<div className='flex justify-center items-center flex-col w-full h-full gap-4'>
                                    <input type="file" className='modal_file' onChange={handleFile} />
                                    <input type="submit" value="Upload" className='modal_submit bg-red-500 py-2 px-4 rounded' />
                                </div>)
                            }
                        </div>
                    </form>
                </div>
            </Modal>

            <div className='sidebarContainer flex flex-col justify-between p-4 sm:p-8 w-full sm:w-1/4 lg:w-1/5 gap-4 h-full mt-3.5'>
                <button className='flex justify-center items-center gap-5 shadow-md p-2 rounded shadow-black w-full border-0 outline-0 cursor-pointer' onClick={() => setOpen(true)}>
                    <AddIcon />
                    <span className='hidden sm:block'>New</span>
                </button>
                <div className='flex flex-col gap-4'>
                    <ul className='flex flex-col gap-2'>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><HomeOutlinedIcon /> Home</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><DriveFolderUploadIcon />My Drive</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><ComputerIcon />Computers</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><ShareIcon />Shared with me</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><ScheduleIcon />Recent</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><StarBorderIcon />Starred</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><ErrorOutlineIcon />Spam</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><DeleteIcon />Trash</li>
                        <li className='flex justify-center items-center gap-2 hover:bg-gray-200 cursor-pointer p-2 rounded'><CloudOutlinedIcon />Storage</li>
                    </ul>
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='h-2 rounded-3xl bg-gray-300 w-full'>
                        <div className='bg-blue-600 h-full rounded-3xl' style={{ width: `${usedPercentage}%` }}></div>
                    </div>
                    <span className='text-sm'>{(usedStorage / 1024 / 1024).toFixed(2)} MB of 100 MB</span>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
