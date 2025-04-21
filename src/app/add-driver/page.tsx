'use client';

import { useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function AddDriver() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [prices, setPrices] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'drivers'), {
        name,
        phone,
        service,
        prices,
        createdAt: Timestamp.now()
      });

      alert('Driver saved to Firebase!');
      setName('');
      setPhone('');
      setService('');
      setPrices('');
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error saving driver. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Become a Driver</h1>
      <p className="text-gray-600 mb-6">Fill in your details to appear in the app.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ayaan Patel"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+230 5123 4567"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Service Name</label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g. Viva Rides"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Price List</label>
          <textarea
            value={prices}
            onChange={(e) => setPrices(e.target.value)}
            placeholder="e.g. Flic - 100, Moka - 600"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </main>
  );
}
