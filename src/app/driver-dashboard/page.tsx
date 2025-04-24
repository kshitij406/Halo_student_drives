"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/Usercontext";
import { db } from "@/firebase/firebase.config";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageBase64?: string;
  priceList: { location: string; price: string }[];
  availability?: "Free" | "Busy";
}

export default function DriverDashboard() {
  const { user } = useUser();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedDrivers, setEditedDrivers] = useState<Record<string, Partial<Driver>>>({});

  useEffect(() => {
    const fetchDrivers = async () => {
      if (!user) return;
      const q = query(collection(db, "drivers"), where("ownerEmail", "==", user.email));
      const snap = await getDocs(q);
      const results = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Driver, "id">) }));
      setDrivers(results);
      setLoading(false);
    };

    fetchDrivers();
  }, [user]);

  const handleFieldChange = <K extends keyof Driver>(
    driverId: string,
    field: K,
    value: Driver[K]
  ) => {
    setEditedDrivers((prev) => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        [field]: value,
      },
    }));
  };
  

  const handlePriceChange = (driverId: string, index: number, field: "location" | "price", value: string) => {
    const current = drivers.find(d => d.id === driverId);
    if (!current) return;
    const newPrices = [...current.priceList];
    newPrices[index][field] = value;

    handleFieldChange(driverId, "priceList", newPrices);
  };

  const saveChanges = async (driverId: string) => {
    if (!editedDrivers[driverId]) return;
    await updateDoc(doc(db, "drivers", driverId), editedDrivers[driverId]);
    setEditedDrivers((prev) => {
      const updated = { ...prev };
      delete updated[driverId];
      return updated;
    });
  };

  const deleteDriver = async (id: string) => {
    await deleteDoc(doc(db, "drivers", id));
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const addPriceEntry = (driverId: string) => {
    const current = drivers.find(d => d.id === driverId);
    if (!current) return;

    const newList = [...current.priceList, { location: "", price: "" }];
    handleFieldChange(driverId, "priceList", newList);
  };

  if (!user) {
    return <main className="p-10 text-red-500 text-center font-bold">Login required</main>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Your Driver Dashboard</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-500">No drivers found for your service.</p>
      ) : (
        drivers.map((driver) => {
          const edits = editedDrivers[driver.id] || {};
          const current = { ...driver, ...edits };

          return (
            <div key={driver.id} className="border border-gray-600 rounded p-4 mb-4 bg-black">
              <input
                className="w-full p-2 rounded bg-gray-800 text-white mb-2"
                value={current.name}
                onChange={(e) => handleFieldChange(driver.id, "name", e.target.value)}
              />
              <input
                className="w-full p-2 rounded bg-gray-800 text-white mb-2"
                value={current.phone}
                onChange={(e) => handleFieldChange(driver.id, "phone", e.target.value)}
              />
              <select
                className="w-full p-2 rounded bg-gray-800 text-white mb-2"
                value={current.availability || "Free"}
                onChange={(e) =>
                  handleFieldChange(driver.id, "availability", e.target.value as "Free" | "Busy")
                }
              >
                <option value="Free">Available</option>
                <option value="Busy">Busy</option>
              </select>

              <label className="block mb-1 text-sm">Prices</label>
              {current.priceList.map((entry, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 p-2 rounded bg-gray-800 text-white"
                    value={entry.location}
                    onChange={(e) => handlePriceChange(driver.id, i, "location", e.target.value)}
                  />
                  <input
                    className="w-24 p-2 rounded bg-gray-800 text-white"
                    value={entry.price}
                    onChange={(e) => handlePriceChange(driver.id, i, "price", e.target.value)}
                  />
                </div>
              ))}

              <button
                onClick={() => addPriceEntry(driver.id)}
                className="text-sm text-yellow-400 hover:underline mb-2"
              >
                ➕ Add Price Entry
              </button>

              <div className="flex justify-between mt-2">
                <button
                  onClick={() => saveChanges(driver.id)}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={() => deleteDriver(driver.id)}
                  className="text-sm text-red-400 hover:underline"
                >
                  ❌ Remove Driver
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
