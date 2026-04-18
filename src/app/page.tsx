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
  availability?: string;
  ratings?: number[];
}

function avgRating(ratings?: number[]) {
  if (!ratings || ratings.length === 0) return 0;
  return ratings.reduce((s, r) => s + r, 0) / ratings.length;
}

function DriverCard({ driver }: { driver: Driver }) {
  const avg = avgRating(driver.ratings);
  const initials = driver.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/driver/${driver.id}`} className="block group">
      <div
        className="card p-5 transition-all duration-200 group-hover:scale-[1.02]"
        style={{
          borderColor: 'var(--border)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--yellow)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px var(--yellow)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-black"
            style={{ background: 'var(--yellow)' }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold truncate">{driver.name}</h4>
              <span
                className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: driver.availability === 'Busy' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                  color: driver.availability === 'Busy' ? 'var(--red)' : 'var(--green)',
                }}
              >
                {driver.availability ?? 'Free'}
              </span>
            </div>

            {/* Stars */}
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  fill={avg >= s ? '#facc15' : 'none'}
                  stroke="#facc15"
                />
              ))}
              <span className="ml-1 text-xs" style={{ color: 'var(--muted)' }}>
                {avg > 0 ? avg.toFixed(1) : 'No ratings'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recent");
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [hasDashboard, setHasDashboard] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "drivers"), where("ownerEmail", "==", user.email))).then(
      (snap) => setHasDashboard(!snap.empty)
    );
  }, [user]);

  useEffect(() => {
    getDocs(collection(db, "drivers")).then((snapshot) => {
      const data: Driver[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          service: d.service,
          phone: d.phone,
          availability: d.availability || "Free",
          ratings: d.ratings || [],
        };
      });
      setTimeout(() => {
        setDrivers(data);
        setLoading(false);
      }, 400);
    });
  }, []);

  const filtered = [...drivers]
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.service.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
      if (sortOption === "rating") return avgRating(b.ratings) - avgRating(a.ratings);
      return 0;
    });

  const grouped = filtered.reduce((acc: Record<string, Driver[]>, driver) => {
    if (!acc[driver.service]) acc[driver.service] = [];
    acc[driver.service].push(driver);
    return acc;
  }, {});

  return (
    <>
      <LoadingScreen show={loading} />

      {!loading && (
        <main className="mx-auto w-full max-w-5xl px-5 py-8">
          {/* Hero */}
          <div className="mb-8">
            <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>
              Hey, {user?.username ?? 'there'} 👋
            </p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">
                Find your ride.
              </h1>
              {hasDashboard && (
                <Link href="/driver-dashboard" className="btn-primary text-sm">
                  My Dashboard
                </Link>
              )}
            </div>
            <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
              Browse verified student drivers offering rides on campus.
            </p>
          </div>

          {/* Search + Sort row */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--muted-2)' }}
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search drivers or services..."
                className="input pl-9"
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="input sm:w-48"
              style={{ cursor: 'pointer' }}
            >
              <option value="recent">Recently Added</option>
              <option value="alphabetical">A → Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Results */}
          {Object.keys(grouped).length === 0 ? (
            <div
              className="card flex flex-col items-center justify-center gap-3 py-20 text-center"
            >
              <div className="text-4xl">🚗</div>
              <p className="font-semibold text-lg">No drivers found</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {searchTerm
                  ? `No results for "${searchTerm}". Try a different search.`
                  : 'No drivers are registered yet. Be the first to drive!'}
              </p>
              <Link href="/add-driver" className="btn-primary mt-2 text-sm">
                Register as a driver
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(grouped).map(([serviceName, serviceDrivers]) => (
                <section key={serviceName}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-lg font-semibold capitalize">{serviceName}</h2>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                    >
                      {serviceDrivers.length}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {serviceDrivers.map((driver) => (
                      <DriverCard key={driver.id} driver={driver} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      )}
    </>
  );
}
