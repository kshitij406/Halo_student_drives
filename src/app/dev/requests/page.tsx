"use client";

import { useEffect, useState,useRef } from "react";
import { db } from "@/firebase/firebase.config";
import {
  collection,
  getDocs,
  deleteDoc,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import LoadingScreen from "../../components/LoadingScreen";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);


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

  const handleApproveDriver = async (serviceId: string, driver: Driver) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const ref = await addDoc(collection(db, "drivers"), {
      ...driver,
      service: service.service,
      ownerEmail: service.ownerEmail,
      availability: "Free",
      ratings: [],
      status: "approved",
    });
    await updateDoc(ref, { id: ref.id });

    const updatedDrivers = service.drivers.filter(
      (d) => d.licenseNumber !== driver.licenseNumber
    );
    const serviceRef = doc(db, "pendingServices", serviceId);

    if (updatedDrivers.length === 0) {
      await deleteDoc(serviceRef);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } else {
      await updateDoc(serviceRef, { drivers: updatedDrivers });
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, drivers: updatedDrivers } : s
        )
      );
    }

    alert(`Approved ${driver.name}`);
  };

  const handleRejectDriver = async (serviceId: string, index: number) => {
    const serviceRef = doc(db, "pendingServices", serviceId);
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const updatedDrivers = [...service.drivers];
    updatedDrivers.splice(index, 1);

    if (updatedDrivers.length === 0) {
      await deleteDoc(serviceRef);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } else {
      await updateDoc(serviceRef, { drivers: updatedDrivers });
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, drivers: updatedDrivers } : s
        )
      );
    }

    alert("Driver rejected");
  };

  const handleRejectService = async (serviceId: string) => {
    await deleteDoc(doc(db, "pendingServices", serviceId));
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    alert("Service rejected.");
  };

  return (
    <>
      <LoadingScreen show={loading} />

      <div className="p-6 text-white max-w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Pending Service Approvals
        </h1>

        <div  ref={scrollContainerRef} className="overflow-x-auto whitespace-nowrap snap-x snap-mandatory scroll-smooth px-4 py-10 scrollbar-custom">
          {services.length === 0 ? (
            <p className="text-gray-400">No pending requests found.</p>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="inline-block snap-center align-top w-[350px] border border-gray-600 p-6 mx-2 rounded bg-black text-lg transition-transform duration-200 hover:scale-105"
              >
                <h2 className="text-xl font-semibold text-yellow-400">
                  Service Name: {service.service}
                </h2>
                <p className="text-sm text-gray-400">
                  Submitted by: {service.ownerEmail}
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Date: {new Date(service.submittedAt).toLocaleString()}
                </p>

                {service.drivers.map((driver, i) => (
                  <div key={i} className="mb-4 bg-black rounded">
                    <p>
                      <strong className="text-yellow-500">Name:</strong>{" "}
                      {driver.name}
                    </p>
                    <p>
                      <strong className="text-yellow-500">Phone:</strong>{" "}
                      {driver.phone}
                    </p>
                    <p>
                      <strong className="text-yellow-500">License No:</strong>{" "}
                      {driver.licenseNumber}
                    </p>

                    {driver.licenseImageBase64 && (
                      <div className="mt-2 w-full h-[200px] relative border border-gray-700 rounded overflow-hidden">
                        <Image
                          src={`data:image/png;base64,${driver.licenseImageBase64}`}
                          alt="License Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <p className="mt-2">
                      <strong className="text-yellow-500">Prices</strong>
                    </p>
                    <ul className="list-none text-lg">
                      {driver.priceList.map((p, idx) => (
                        <li key={idx}>
                          {p.location}-Rs.{p.price}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        onClick={() => handleApproveDriver(service.id, driver)}
                        className="p-2 outline-1 outline-yellow-500 rounded transition font-semibold
                      text-white text-lg hover:text-black hover:bg-green-400 hover:outline-green-400"
                      >
                        Approve Driver
                      </button>
                      <button
                        onClick={() => handleRejectDriver(service.id, i)}
                        className="p-2 outline-1 outline-yellow-500 rounded transition font-semibold text-white text-lg
                      hover:text-black hover:bg-red-500 hover:outline-red-500"
                      >
                        Reject Driver
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleRejectService(service.id)}
                  className="w-full mt-3 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-red-700 hover:text-white"
                >
                  Reject Entire Service
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
