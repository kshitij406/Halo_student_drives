'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import StarRating from '../../components/StarRatings'; 

interface Driver {
  id: string;
  name: string;
  phone: string;
  service: string;
  prices: string;
  ratings?: number[];
}

export default function ServicePage() {
  const { slug } = useParams();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

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
        ratings: data.ratings ?? [],
      });
    });

    const filtered = allDrivers.filter(
      (driver) =>
        driver.service.toLowerCase().replaceAll(' ', '-') === slug
    );

    setDrivers(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, [slug]);

  return (
    <main className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold capitalize mb-4">
        {slug?.toString().replaceAll('-', ' ')} Drivers
      </h1>

      {loading ? (
        <p>Loading drivers...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-400">No matching drivers found.</p>
      ) : (
        <div className="space-y-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="border p-4 rounded-lg shadow bg-white text-black"
            >
              <h2 className="font-semibold text-lg">{driver.name}</h2>
              <p className="text-gray-700">{driver.prices}</p>
              <p className="text-gray-500 italic">{driver.service}</p>
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

              <StarRating
                driverId={driver.id}
                currentRatings={driver.ratings ?? []}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
