"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.config";
import { collection, getDocs } from "firebase/firestore";
import { Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Driver {
  id: string;
  name: string;
  service: string;
  phone: string;
  ratings?: number[];
  availability: string;
  priceList: { location: string; price: string }[];
}

export default function ServicePage() {
  const { slug } = useParams();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const snapshot = await getDocs(collection(db, "drivers"));
      const data: Driver[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          service: d.service,
          phone: d.phone,
          ratings: d.ratings || [],
          availability: d.availability || "Free",
          priceList: d.priceList || [],
        };
      });

      const filtered = data.filter((driver) =>
        driver.service?.toLowerCase().includes(String(slug).toLowerCase())
      );

      setDrivers(filtered);
    };

    fetchDrivers();
  }, [slug]);

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, ""); // Keep only digits
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 capitalize">{slug} Drivers</h1>

      {drivers.map((driver) => {
        const ratings = driver.ratings ?? [];
        const avgRating = ratings.length
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        const waPhone = formatPhoneForWhatsApp(driver.phone);
        const waLink = `https://wa.me/${waPhone}`;

        return (
          <div key={driver.id} className="mb-6">
            <Link href={`/driver/${driver.id}`} className="block">
              <div className="bg-white text-black p-4 rounded shadow hover:shadow-lg transition duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{driver.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <Star size={16} fill="#facc15" stroke="#facc15" />
                    <span>{avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="italic text-sm text-gray-600">
                  Service: {driver.service}
                </p>
                <p className="text-sm">Phone: {driver.phone}</p>

                <div className="flex items-center gap-3 mt-1">
                  <span
                    className={`text-sm ${
                      driver.availability === "Free"
                        ? "text-green-500"
                        : "text-red-500"
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

            {/* WhatsApp Button */}
            <div className="mt-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-full transition"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
