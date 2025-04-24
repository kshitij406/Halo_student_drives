// ✅ Updated: /dev/requests reads from pendingServices and allows per-driver approval

"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

interface Driver {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageBase64?: string;
  priceList: { location: string; price: string }[];
}

interface PendingService {
  id: string;
  service: string;
  ownerEmail: string;
  submittedAt: string;
  drivers: Driver[];
}

export default function DevRequestsPage() {
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const snapshot = await getDocs(collection(db, "pendingServices"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PendingService, "id">),
    }));
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveDriver = async (serviceId: string, driverIndex: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const driver = service.drivers[driverIndex];
    await addDoc(collection(db, "drivers"), {
      ...driver,
      service: service.service,
      ownerEmail: service.ownerEmail,
      availability: "Free",
      ratings: [],
    });

    // Remove the driver from the service list
    const updatedDrivers = service.drivers.filter((_, i) => i !== driverIndex);

    if (updatedDrivers.length === 0) {
      await deleteDoc(doc(db, "pendingServices", serviceId));
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } else {
      const updatedServices = services.map((s) =>
        s.id === serviceId ? { ...s, drivers: updatedDrivers } : s
      );
      setServices(updatedServices);
    }
  };

  const handleRejectService = async (serviceId: string) => {
    await deleteDoc(doc(db, "pendingServices", serviceId));
    setServices(services.filter((s) => s.id !== serviceId));
  };

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧾 Pending Service Approvals</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-400">No pending requests found.</p>
      ) : (
        services.map((service) => (
          <div key={service.id} className="border border-gray-600 p-4 rounded mb-6 bg-black">
            <h2 className="text-xl font-semibold text-yellow-400">{service.service}</h2>
            <p className="text-sm text-gray-400">Submitted by: {service.ownerEmail}</p>
            <p className="text-sm text-gray-400 mb-4">
              Date: {new Date(service.submittedAt).toLocaleString()}
            </p>

            {service.drivers.map((driver, i) => (
              <div key={i} className="mb-4 p-3 bg-gray-900 rounded">
                <p><strong>Name:</strong> {driver.name}</p>
                <p><strong>Phone:</strong> {driver.phone}</p>
                <p><strong>License No:</strong> {driver.licenseNumber}</p>
                {driver.licenseImageBase64 && (
                  <img
                    src={`data:image/png;base64,${driver.licenseImageBase64}`}
                    alt="License"
                    className="rounded mt-2 border max-w-xs"
                  />
                )}
                <p className="mt-2 font-semibold">Prices:</p>
                <ul className="list-disc list-inside text-sm">
                  {driver.priceList.map((entry, idx) => (
                    <li key={idx}>{entry.location}: Rs {entry.price}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleApproveDriver(service.id, i)}
                  className="mt-3 text-green-400 text-sm underline hover:text-green-300"
                >
                  ✅ Approve Driver
                </button>
              </div>
            ))}

            <button
              onClick={() => handleRejectService(service.id)}
              className="text-red-400 text-sm mt-3 underline hover:text-red-500"
            >
              ❌ Reject Entire Service
            </button>
          </div>
        ))
      )}
    </div>
  );
}