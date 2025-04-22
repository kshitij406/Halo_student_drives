'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/firebase/firebase.config';
import { collection, getDocs } from 'firebase/firestore';

interface Driver {
  id: string;
  name: string;
  phone: string;
  service: string;
  prices: string;
}

const Home = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDrivers = async () => {
      const querySnapshot = await getDocs(collection(db, 'drivers'));
      const data: Driver[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Driver);
      });
      setDrivers(data);

      const uniqueServices = [...new Set(data.map((d) => d.service))];
      setServices(uniqueServices);
    };

    fetchDrivers();
  }, []);

  const filteredServices = services.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="p-4 max-w-screen-xl mx-auto text-white">
      <h1 className="text-3xl font-bold">Start Riding Now!</h1>
      <p className="text-gray-400 mb-3">Find a ride service below:</p>

      <input
        type="text"
        placeholder="Search by driver or service name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 p-2 rounded border border-gray-300 text-white"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {filteredServices.map((service) => (
          <Link
            key={service}
            href={`/service/${service.toLowerCase().replace(/\s+/g, '-')}`}
            className="text -xl bg-white text-center text-black font-semibold py-6 rounded-lg hover:bg-yellow-500 transition"
          >
            {service}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Recently Added Drivers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDrivers.slice(-4).reverse().map((driver) => (
          <div
            key={driver.id}
            className="bg-white text-black p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <p className="font-semibold text-gray-800 mb-1">{driver.name}</p>
            <p className="text-sm text-gray-600">{driver.prices}</p>
            <p className="text-sm text-gray-500 italic mb-2">{driver.service}</p>
            <a href={`tel:${driver.phone}`} className="text-blue-600 block mb-1">
              📞 {driver.phone}
            </a>
            <a
              href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600"
            >
              💬 WhatsApp
            </a>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
