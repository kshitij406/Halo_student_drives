'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useUser } from './../context/Usercontext';

interface Driver {
  id: string;
  name: string;
  service: string;
  phone: string;
  ratings?: number[];
}

export default function HomePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchDrivers = async () => {
      const snapshot = await getDocs(collection(db, 'drivers'));
      const data: Driver[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          service: d.service,
          phone: d.phone,
          ratings: d.ratings || [],
        };
      });
      setDrivers(data);
    };
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'rating') {
      const avgA =
        Array.isArray(a.ratings) && a.ratings.length > 0
          ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length
          : 0;
      const avgB =
        Array.isArray(b.ratings) && b.ratings.length > 0
          ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length
          : 0;
      return avgB - avgA;
    }
    return 0;
  });

  const groupedByService = sortedDrivers.reduce(
    (acc: Record<string, Driver[]>, driver) => {
      if (!acc[driver.service]) acc[driver.service] = [];
      acc[driver.service].push(driver);
      return acc;
    },
    {}
  );

  return (
    <main className="p-4 max-w-screen-xl mx-auto text-white">
      <h1 className="px-4 py-2 text-white">Hi, {user?.username || 'Guest'}</h1>
      <h1 className="text-3xl font-bold">Start Riding Now!</h1>
      <p className="text-gray-400 mb-3">Find a ride service below</p>

      {/* Search Bar with Icon */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg">
          🔍
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for services or drivers"
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-600 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6 flex items-center gap-2">
        <label className="text-white font-medium">Sort Drivers:</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-black text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="recent">Recently Added</option>
          <option value="alphabetical">Alphabetically (A–Z)</option>
          <option value="rating">Rating (High → Low)</option>
        </select>
      </div>

      {/* Grouped Driver Cards by Service */}
      {Object.entries(groupedByService).map(([serviceName, serviceDrivers]) => (
        <div key={serviceName} className="mb-8">
          <h2 className="text-xl font-bold mb-3 capitalize">{serviceName}</h2>

          {serviceDrivers.map((driver) => {
            const avgRating =
              driver.ratings && driver.ratings.length > 0
                ? driver.ratings.reduce((a, b) => a + b, 0) /
                  driver.ratings.length
                : 0;

            return (
              <Link key={driver.id} href={`/driver/${driver.id}`} className="block mb-4">
                <div className="bg-white text-black p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{driver.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm">
                      <Star size={16} fill="#facc15" stroke="#facc15" />
                      <span>{avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="italic text-sm text-gray-600">Phone: {driver.phone}</p>
                  <div className="flex mt-1 gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={avgRating >= star ? '#facc15' : 'none'}
                        stroke="#facc15"
                      />
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ))}
    </main>
  );
}
