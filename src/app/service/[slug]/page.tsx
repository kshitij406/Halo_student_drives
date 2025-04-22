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
  priceList: { location: string; price: string }[];
}

interface PageProps {
  params: { slug: string };
}

export default function ServicePage({ params }: PageProps) {
  const slug = params.slug;
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
          priceList: d.priceList || [],
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
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'rating') {
      const avgA =
        (a.ratings ?? []).reduce((sum, r) => sum + r, 0) / ((a.ratings ?? []).length || 1);
      const avgB =
        (b.ratings ?? []).reduce((sum, r) => sum + r, 0) / ((b.ratings ?? []).length || 1);
      return avgB - avgA;
    }
    return 0;
  });

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 capitalize">{slug} Drivers</h1>

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="p-2 mb-4 text-black border rounded"
      >
        <option value="recent">Recently Added</option>
        <option value="alphabetical">Alphabetically (A–Z)</option>
        <option value="rating">Rating (High → Low)</option>
      </select>

      {sortedDrivers.map((driver) => {
        const avgRating =
          (driver.ratings ?? []).reduce((sum, r) => sum + r, 0) / ((driver.ratings ?? []).length || 1);

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

              {driver.priceList.length > 0 && (
                <div className="mt-2 text-sm">
                  <h4 className="font-semibold">Price List:</h4>
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
