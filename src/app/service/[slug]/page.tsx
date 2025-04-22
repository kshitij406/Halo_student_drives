'use client';
import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { Star } from 'lucide-react';
import Link from 'next/link';

interface Driver {
  id: string;
  name: string;
  service: string;
  phone: string;
  ratings?: number[];
  availability: string;
  priceList: { location: string; price: string }[];  // Make sure this is part of the interface
}

export default function ServicePage({ slug }: { slug: string }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [sortOption, setSortOption] = useState('recent');

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
          availability: d.availability || 'Free',
          priceList: d.priceList || [],  // Ensure priceList is included
        };
      });

      const filtered = data.filter((driver) =>
        driver.service.toLowerCase().includes(slug.toLowerCase())
      );
      setDrivers(filtered);
    };

    fetchDrivers();
  }, [slug]);

  const sortedDrivers = drivers.sort((a, b) => {
    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name); // Alphabetical sorting
    } else if (sortOption === 'rating') {
      const avgA =
        a.ratings && a.ratings.length > 0
          ? a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length
          : 0;
      const avgB =
        b.ratings && b.ratings.length > 0
          ? b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length
          : 0;
      return avgB - avgA; // Sort by rating
    }
    return 0; // Default to no sorting
  });

  return (
    <div>
      <h1>{slug} Drivers</h1>
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="p-2 text-black border rounded"
      >
        <option value="recent">Recently Added</option>
        <option value="alphabetical">Alphabetically (A–Z)</option>
        <option value="rating">Rating (High → Low)</option>
      </select>

      {sortedDrivers.map((driver) => {
        const avgRating =
          driver.ratings && driver.ratings.length > 0
            ? driver.ratings.reduce((sum, r) => sum + r, 0) / driver.ratings.length
            : 0;

        return (
          <Link key={driver.id} href={`/driver/${driver.id}`} className="block mb-4">
            <div className="bg-white text-black p-4 rounded shadow hover:shadow-lg transition duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{driver.name}</h3>
                <div className="flex items-center gap-1 text-yellow-500 text-sm">
                  <Star size={16} fill="#facc15" stroke="#facc15" />
                  <span>{avgRating.toFixed(1)}</span>
                </div>
              </div>
              <p className="italic text-sm text-gray-600">Service: {driver.service}</p>
              <p className="text-sm">Phone: {driver.phone}</p>
              <div className="flex mt-1 gap-1">
                <span
                  className={`text-sm ${
                    driver.availability === 'Free' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {driver.availability}
                </span>
              </div>

              {/* Display Price List */}
              {driver.priceList.length > 0 && (
                <div className="mt-2 text-sm">
                  <h4>Price List:</h4>
                  {driver.priceList.map((price, index) => (
                    <p key={index} className="text-gray-600">
                      {price.location}: {price.price}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
