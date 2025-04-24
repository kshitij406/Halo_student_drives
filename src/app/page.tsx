"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.config";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { Star } from "lucide-react";
import { useUser } from "@/context/Usercontext";
import LoadingScreen from "./components/LoadingScreen";

interface Driver {
  id: string;
  name: string;
  service: string;
  phone: string;
  ratings?: number[];
}

export default function HomePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [loading, setLoading] = useState(true);

  const { user } = useUser();

  const [hasDashboard, setHasDashboard] = useState(false);

  useEffect(() => {
    const checkDashboard = async () => {
      if (!user) return;
      const snap = await getDocs(
        query(collection(db, "drivers"), where("ownerEmail", "==", user.email))
      );
      setHasDashboard(!snap.empty);
    };

    checkDashboard();
  }, [user]);

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
        };
      });

      setTimeout(() => {
        setDrivers(data);
        setLoading(false);
      }, 500);
    };

    fetchDrivers();
  }, []);

  return (
    <>
      <LoadingScreen show={loading} />

      {!loading && (
        <main className="px-4 py-6 max-w-7xl w-full mx-auto text-white">
          <div className="mb-6">
            <h1 className="text-xl text-gray-400">
              Hi, {user?.username || "Guest"}
            </h1>
              <div className="flex justify-between items-center w-full">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Your Ride, Reimagined.
            </h2>

            {hasDashboard && (
              <Link
                href="/driver-dashboard"
                className="text-sm md:text-base px-3 py-2 md:px-4 md:py-3 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300"
              >
                Driver Dashboard
              </Link>
            )}
          </div>

            <p className="text-gray-400 text-lg">
              Browse verified student drivers offering rides nearby.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drivers or services"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="mb-10 flex items-center gap-3">
            <label className="text-sm text-gray-300">Sort:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-black text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="recent">Recently Added</option>
              <option value="alphabetical">Alphabetically (A–Z)</option>
              <option value="rating">Rating (High → Low)</option>
            </select>
          </div>

          {/* Grouped Drivers */}
          <div className="space-y-10">
            {Object.entries(
              [...drivers]
                .filter(
                  (driver) =>
                    driver.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    driver.service
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => {
                  if (sortOption === "alphabetical") {
                    return a.name.localeCompare(b.name);
                  } else if (sortOption === "rating") {
                    const avgA = a.ratings?.length
                      ? a.ratings.reduce((sum, r) => sum + r, 0) /
                        a.ratings.length
                      : 0;
                    const avgB = b.ratings?.length
                      ? b.ratings.reduce((sum, r) => sum + r, 0) /
                        b.ratings.length
                      : 0;
                    return avgB - avgA;
                  }
                  return 0;
                })
                .reduce((acc: Record<string, Driver[]>, driver) => {
                  if (!acc[driver.service]) acc[driver.service] = [];
                  acc[driver.service].push(driver);
                  return acc;
                }, {})
            ).map(([serviceName, serviceDrivers]) => (
              <div key={serviceName}>
                <h3 className="text-2xl font-semibold mb-4 capitalize text-white">
                  {serviceName}
                </h3>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {serviceDrivers.map((driver) => {
                    const avgRating =
                      driver.ratings && driver.ratings.length > 0
                        ? driver.ratings.reduce((sum, r) => sum + r, 0) /
                          driver.ratings.length
                        : 0;

                    return (
                      <Link
                        key={driver.id}
                        href={`/driver/${driver.id}`}
                        className="group"
                      >
                        <div className="bg-[#1C1C1C] p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-transparent group-hover:border-yellow-400">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-lg text-white">
                              {driver.name}
                            </h4>
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                              <Star size={16} fill="#facc15" stroke="#facc15" />
                              <span>{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 italic mb-1">
                            Phone: {driver.phone}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={avgRating >= star ? "#facc15" : "none"}
                                stroke="#facc15"
                              />
                            ))}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}
    </>
  );
}
