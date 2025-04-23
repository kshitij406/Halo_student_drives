'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Driver {
  id?: string;
  name: string;
  phone: string;
  service: string;
  licenseNumber: string;
  availability: string;
}

export default function DevPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newDriver, setNewDriver] = useState<Driver>({
    name: '',
    phone: '',
    service: '',
    licenseNumber: '',
    availability: 'Free',
  });
  const [loading, setLoading] = useState(false);
  const [devLoggedIn, setDevLoggedIn] = useState(false);
  const [devUsername, setDevUsername] = useState('');
  const [devPassword, setDevPassword] = useState('');

  const fetchDrivers = async () => {
    const snapshot = await getDocs(collection(db, 'drivers'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Driver[];
    setDrivers(data);
  };

  useEffect(() => {
    if (localStorage.getItem('dev-auth') === 'true') {
      setDevLoggedIn(true);
      fetchDrivers();
    }
  }, []);

  const handleLogin = () => {
    if (
      devUsername === process.env.NEXT_PUBLIC_DEV_USERNAME &&
      devPassword === process.env.NEXT_PUBLIC_DEV_PASSWORD
    ) {
      localStorage.setItem('dev-auth', 'true');
      setDevLoggedIn(true);
      fetchDrivers();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dev-auth');
    setDevLoggedIn(false);
  };

  const handleAddDriver = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'drivers'), {
        ...newDriver,
        ratings: [],
        priceList: [],
      });
      setNewDriver({ name: '', phone: '', service: '', licenseNumber: '', availability: 'Free' });
      fetchDrivers();
    } catch (error) {
      console.error('Error adding driver:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'drivers', id));
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  if (!devLoggedIn) {
    return (
      <div className="p-6 max-w-md mx-auto text-white">
        <h1 className="text-2xl font-bold mb-4">🔐 Dev Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={devUsername}
          onChange={(e) => setDevUsername(e.target.value)}
          className="w-full mb-2 p-2 rounded bg-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={devPassword}
          onChange={(e) => setDevPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-yellow-400 text-black font-bold py-2 rounded hover:bg-yellow-300"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛠️ Developer Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Driver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="p-2 rounded bg-gray-800"
            placeholder="Name"
            value={newDriver.name}
            onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
          />
          <input
            className="p-2 rounded bg-gray-800"
            placeholder="Phone"
            value={newDriver.phone}
            onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
          />
          <input
            className="p-2 rounded bg-gray-800"
            placeholder="Service"
            value={newDriver.service}
            onChange={e => setNewDriver({ ...newDriver, service: e.target.value })}
          />
          <input
            className="p-2 rounded bg-gray-800"
            placeholder="License Number"
            value={newDriver.licenseNumber}
            onChange={e => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
          />
        </div>
        <button
          className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-300"
          onClick={handleAddDriver}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Driver'}
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">📋 All Drivers</h2>
        {drivers.map((driver, index) => (
          <div key={index} className="mb-2 p-3 rounded bg-black border border-gray-700">
            <p><span className="font-bold text-yellow-400">Name:</span> {driver.name}</p>
            <p><span className="font-bold text-yellow-400">Phone:</span> {driver.phone}</p>
            <p><span className="font-bold text-yellow-400">Service:</span> {driver.service}</p>
            <p><span className="font-bold text-yellow-400">License:</span> {driver.licenseNumber}</p>
            <p><span className="font-bold text-yellow-400">Availability:</span> {driver.availability}</p>
            <button
              onClick={() => driver.id && handleDeleteDriver(driver.id)}
              className="mt-2 text-red-400 text-sm underline hover:text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 