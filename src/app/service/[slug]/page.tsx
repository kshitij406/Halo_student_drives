'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/firebase.config';
import { collection, getDocs } from 'firebase/firestore';

interface Driver {
  id: string;
  name: string;
  phone: string;
  service: string;
  prices: string;
}

export default function ServicePage() {
  const { slug } = useParams();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      const querySnapshot = await getDocs(collection(db, 'drivers'));
      const allDrivers: Driver[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allDrivers.push({
          id: doc.id,
          name: data.name,
          phone: data.phone,
          service: data.service,
          prices: data.prices,
        });
      });

      const filtered = allDrivers.filter(
        (driver) =>
          driver.service.toLowerCase().replaceAll(' ', '-') === slug
      );

      setDrivers(filtered);
      setLoading(false);
    };

    fetchDrivers();
  }, [slug]);

  const filteredDrivers = drivers.filter((driver) => {
    const query = searchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.service.toLowerCase().includes(query)
    );
  });
  

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold capitalize mb-4">
        {slug?.toString().replaceAll('-', ' ')} Drivers
      </h1>

      <input
        type="text"
        placeholder="Search by name or location..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded border border-gray-300"
      />

      {loading ? (
        <p>Loading drivers...</p>
      ) : filteredDrivers.length === 0 ? (
        <p className="text-gray-600">No matching drivers found.</p>
      ) : (
        <div className="space-y-4">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              className="border p-4 rounded-lg shadow bg-white"
            >
              <h2 className="font-semibold text-lg">{driver.name}</h2>
              <p className="text-gray-700">{driver.prices}</p>
              <a
                href={`tel:${driver.phone}`}
                className="text-blue-600 hover:underline block mt-2"
              >
                📞 {driver.phone}
              </a>
              <a
                href={`https://wa.me/${driver.phone.replace('+', '')}`}
                target="_blank"
                className="text-green-600 hover:underline block"
              >
                💬 WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
