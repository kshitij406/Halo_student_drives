'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase.config';
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

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
    const snapshot = await getDocs(collection(db, 'pendingServices'));
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<PendingService, 'id'>)
    }));
    setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);
  
  const handleApproveDriver = async (serviceId: string, driver: Driver) => {
    const ref = await addDoc(collection(db, 'drivers'), {
      ...driver,
      service: services.find(s => s.id === serviceId)?.service,
      ownerEmail: services.find(s => s.id === serviceId)?.ownerEmail,
      availability: 'Free',
      ratings: [],
      status: 'approved',
    });
    await updateDoc(ref, { id: ref.id });    
    alert(`Approved ${driver.name}`);
  };

  const handleRejectDriver = async (serviceId: string, index: number) => {
    const serviceRef = doc(db, 'pendingServices', serviceId);
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const updatedDrivers = [...service.drivers];
    updatedDrivers.splice(index, 1);

    if (updatedDrivers.length === 0) {
      await deleteDoc(serviceRef);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } else {
      await updateDoc(serviceRef, { drivers: updatedDrivers });
      setServices(prev =>
        prev.map(s => s.id === serviceId ? { ...s, drivers: updatedDrivers } : s)
      );
    }

    alert('Driver rejected');
  };

  const handleRejectService = async (serviceId: string) => {
    await deleteDoc(doc(db, 'pendingServices', serviceId));
    setServices(services.filter(s => s.id !== serviceId));
    alert('Service rejected.');
  };

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧾 Pending Service Approvals</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : services.length === 0 ? (
        <p className="text-gray-400">No pending requests found.</p>
      ) : (
        services.map(service => (
          <div key={service.id} className="border border-gray-600 p-4 rounded mb-6 bg-black">
            <h2 className="text-xl font-semibold text-yellow-400">{service.service}</h2>
            <p className="text-sm text-gray-400">Submitted by: {service.ownerEmail}</p>
            <p className="text-sm text-gray-400 mb-4">Date: {new Date(service.submittedAt).toLocaleString()}</p>

            {service.drivers.map((driver, i) => (
              <div key={i} className="mb-4 p-3 bg-gray-900 rounded">
                <p><strong>Name:</strong> {driver.name}</p>
                <p><strong>Phone:</strong> {driver.phone}</p>
                <p><strong>License No:</strong> {driver.licenseNumber}</p>
                <p><strong>Prices:</strong></p>
                <ul className="list-disc list-inside text-sm">
                  {driver.priceList.map((p, idx) => (
                    <li key={idx}>{p.location}: Rs {p.price}</li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-4">
                  <button
                    onClick={() => handleApproveDriver(service.id, driver)}
                    className="text-green-400 text-sm underline hover:text-green-300"
                  >
                    ✅ Approve Driver
                  </button>
                  <button
                    onClick={() => handleRejectDriver(service.id, i)}
                    className="text-red-400 text-sm underline hover:text-red-500"
                  >
                    ❌ Reject Driver
                  </button>
                </div>
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
