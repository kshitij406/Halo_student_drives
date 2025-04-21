'use client';

import { useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AddDriver() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [prices, setPrices] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'drivers'), {
        name,
        phone,
        service: service.toLowerCase().trim(),
        prices,
        createdAt: new Date()
      });

      alert('Driver added successfully!');
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Become a Driver</h1>
      <p className="text-gray-600 mb-6">Fill in your details to appear in the app.</p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
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

        {/* Phone */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+230 5123 4567"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        {/* Service Name */}
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

        {/* Price List */}
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

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
