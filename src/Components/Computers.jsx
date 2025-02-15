import React, { useEffect, useState } from 'react';
import DevicesIcon from '@mui/icons-material/Devices';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip } from '@mui/material';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query, where, deleteDoc } from 'firebase/firestore';

function Computers() {
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const devicesCollection = collection(db, 'devices');
      const q = query(devicesCollection, where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setDevices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const deviceRef = doc(db, 'devices', id);
      await updateDoc(deviceRef, { status: currentStatus === 'Online' ? 'Offline' : 'Online' });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addDevice = async (e) => {
    e.preventDefault();

    if (!deviceName.trim() || !auth.currentUser) {
      alert("Please enter a device name and make sure you're logged in.");
      return;
    }

    try {
      const user = auth.currentUser;

      const docRef = await addDoc(collection(db, "devices"), {
        uid: user.uid,
        name: deviceName.trim(),
        status: "Online",
        last_active: serverTimestamp()
      });

      console.log("Device added with ID:", docRef.id);
      setDeviceName("");
    } catch (error) {
      console.error("Error adding device:", error);
      alert("Error adding device: " + error.message);
    }
  };

  const deleteDevice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'devices', id));
      console.log("Device deleted successfully.");
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Error deleting device: " + error.message);
    }
  };

  return (
    <div className="p-8 lg:p-12 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-lg transition-all hover:shadow-xl">
        <DevicesIcon className="text-blue-500 animate-pulse" style={{ fontSize: 42 }} />
        <h1 className="font-bold text-4xl text-gray-900">Computers</h1>
      </header>

      {/* Add Device Form */}
      <form onSubmit={addDevice} className="mb-8 flex gap-4 bg-white p-6 rounded-lg shadow-lg transition hover:shadow-xl">
        <input 
          type="text" 
          placeholder="Enter Device Name" 
          value={deviceName} 
          onChange={(e) => setDeviceName(e.target.value)}
          className="border p-4 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
        />
        <button type="submit" className="bg-blue-500 text-white px-5 py-4 rounded-lg flex items-center gap-3 hover:bg-blue-600 transition-all transform active:scale-95 text-lg">
          <AddIcon /> Add
        </button>
      </form>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-4 text-xl mb-4">
          <p>Name</p>
          <p>Status</p>
          <p>Toggle</p>
          <p>Delete</p>
        </div>

        {devices.length === 0 ? (
          <p className="text-center text-gray-500 py-6 text-lg">No Devices Found</p>
        ) : (
          devices.map(device => (
            <div key={device.id} className="grid grid-cols-4 items-center gap-3
            p-5 mt-4 rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg hover:scale-[1.03] transition-all transform">
              <p className="text-gray-900 font-medium text-xl">{device.name}</p>
              <p className={`font-medium text-xl ${device.status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>{device.status}</p>

              <Tooltip title="Toggle Status">
                <button 
                  onClick={() => toggleStatus(device.id, device.status)} 
                  className="text-gray-600 hover:text-gray-900 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform active:scale-90">
                  <PowerSettingsNewIcon />
                </button>
              </Tooltip>

              <Tooltip title="Delete Device">
                <button 
                  onClick={() => deleteDevice(device.id)} 
                  className="text-red-600 hover:text-red-900 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform active:scale-90">
                  <DeleteIcon />
                </button>
              </Tooltip>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Computers;
