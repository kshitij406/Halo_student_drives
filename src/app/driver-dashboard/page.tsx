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

function AvailabilityToggle({
  value,
  onChange,
}: {
  value: "Free" | "Busy";
  onChange: (newValue: "Free" | "Busy") => void;
}) {
  const enabled = value === "Free";

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={() => onChange(enabled ? "Busy" : "Free")}
      />
      <div
        className={`w-14 h-8 rounded-full transition-colors duration-300 ${
          enabled ? "bg-green-500" : "bg-gray-400"
        }`}
      ></div>
      <div
        className={`absolute top-0.5 left-0.5 w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 transform ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </label>
  );
}

export default function DriverDashboard() {
  const { user } = useUser();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedDrivers, setEditedDrivers] = useState<Record<string, Partial<Driver>>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      if (!user) return;
      const q = query(collection(db, "drivers"), where("ownerEmail", "==", user.email));
      const snap = await getDocs(q);
      const results = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Driver, "id">),
      }));
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

  const handlePriceChange = (
    driverId: string,
    index: number,
    field: "location" | "price",
    value: string
  ) => {
    const current = drivers.find((d) => d.id === driverId);
    if (!current) return;

    const updatedPrices = [...(editedDrivers[driverId]?.priceList || current.priceList)];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: value,
    };

    handleFieldChange(driverId, "priceList", updatedPrices);
  };

  const removePriceEntry = (driverId: string, index: number) => {
    const current = drivers.find((d) => d.id === driverId);
    if (!current) return;

    const updatedPrices = [...(editedDrivers[driverId]?.priceList || current.priceList)];
    updatedPrices.splice(index, 1);

    handleFieldChange(driverId, "priceList", updatedPrices);
  };

  const saveChanges = async (driverId: string) => {
    if (!editedDrivers[driverId]) return;

    const updatedData = editedDrivers[driverId];
    await updateDoc(doc(db, "drivers", driverId), updatedData);

    setEditedDrivers((prev) => {
      const updated = { ...prev };
      delete updated[driverId];
      return updated;
    });

    // Update main drivers state
    setDrivers((prev) =>
      prev.map((d) =>
        d.id === driverId ? { ...d, ...updatedData } : d
      )
    );

    setSuccessMessage("Driver changes saved successfully");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const deleteDriver = async (id: string) => {
    await deleteDoc(doc(db, "drivers", id));
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  const addPriceEntry = (driverId: string) => {
    const current = drivers.find((d) => d.id === driverId);
    if (!current) return;

    const updatedPrices = [...(editedDrivers[driverId]?.priceList || current.priceList)];
    updatedPrices.push({ location: "", price: "" });

    handleFieldChange(driverId, "priceList", updatedPrices);
  };

  if (!user) {
    return <main className="p-10 text-red-500 text-center font-bold">Login required</main>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Driver Dashboard</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : drivers.length === 0 ? (
        <p className="text-gray-500 text-center">No drivers found for your service.</p>
      ) : (
        drivers.map((driver) => {
          const edits = editedDrivers[driver.id] || {};
          const current = { ...driver, ...edits };

          return (
            <div key={driver.id} className="border border-gray-600 rounded p-4 mb-6 bg-black">
              <label className="block mb-1 text-yellow-500 font-semibold">Name</label>
              <input
                className="w-full p-2 mb-3 rounded bg-black outline-1 outline-gray-600 text-white"
                value={current.name}
                onChange={(e) => handleFieldChange(driver.id, "name", e.target.value)}
              />

              <label className="block mb-1 text-yellow-500 font-semibold">Phone Number</label>
              <input
                className="w-full p-2 mb-3 rounded outline-1 outline-gray-600 bg-black text-white"
                value={current.phone}
                onChange={(e) => handleFieldChange(driver.id, "phone", e.target.value)}
              />

              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-500 font-semibold">Driver Availability</span>
                <AvailabilityToggle
                  value={current.availability || "Free"}
                  onChange={(val) => handleFieldChange(driver.id, "availability", val)}
                />
              </div>

              <label className="block mb-2 text-yellow-500 font-semibold">Prices</label>
              <div className="flex flex-col gap-2 mb-4">
                {current.priceList.map((entry, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="flex-[3] min-w-0 p-2 rounded outline-1 outline-gray-600 bg-black text-white font-bold"
                      value={entry.location}
                      onChange={(e) =>
                        handlePriceChange(driver.id, i, "location", e.target.value)
                      }
                    />
                    <input
                      className="flex-[1] min-w-0 p-2 rounded outline-1 outline-gray-600 bg-black text-white font-bold"
                      value={entry.price}
                      onChange={(e) =>
                        handlePriceChange(driver.id, i, "price", e.target.value)
                      }
                    />
                    <button
                      onClick={() => removePriceEntry(driver.id, i)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addPriceEntry(driver.id)}
                className="w-full mb-2 text-center text-lg text-black bg-yellow-500 py-2 rounded font-semibold hover:bg-yellow-400"
              >
                Add Price Entry
              </button>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-2">
                <button
                  onClick={() => saveChanges(driver.id)}
                  className="w-full mb-2 sm:mb-0 text-lg text-black bg-yellow-500 py-2 rounded hover:bg-green-600 font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => deleteDriver(driver.id)}
                  className="w-full text-lg text-black bg-yellow-500 py-2 rounded hover:bg-red-600 font-semibold"
                >
                  Remove Driver
                </button>
              </div>
            </div>
          );
        })
      )}

      {successMessage && (
        <p className="text-green-400 font-bold text-center text-sm mt-4">
          {successMessage}
        </p>
      )}
    </div>
  );
}
