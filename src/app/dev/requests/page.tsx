"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase.config";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import Image from "next/image";
import { useUser } from "@/context/Usercontext";

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageUrl?: string;
  service: string;
  priceList?: { location: string; price: string }[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function ReviewRequestsPage() {
  const { user } = useUser();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchDrivers = async () => {
      const q = query(
        collection(db, "pendingDrivers"),
        where("status", "==", filter)
      );
      const snapshot = await getDocs(q);
      const drivers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Driver, "id">),
      }));
      setDrivers(drivers);
    };

    fetchDrivers();
  }, [filter]);

  const handleApprove = async (driverId: string) => {
    try {
      const pendingRef = doc(db, "pendingDrivers", driverId);
      const pendingSnap = await getDoc(pendingRef);

      if (pendingSnap.exists()) {
        const driverData = pendingSnap.data();

        await addDoc(collection(db, "drivers"), {
          ...driverData,
          approved: true,
          availability: "Free",
          ratings: [],
        });

        await deleteDoc(pendingRef);

        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
      }
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const handleReject = async (driverId: string) => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    await updateDoc(doc(db, "pendingDrivers", driverId), {
      status: "rejected",
      rejectionReason: rejectReason,
    });
    setRejectReason("");
    setDrivers((prev) => prev.filter((d) => d.id !== driverId));
  };

  if (user?.role !== "dev") {
    return (
      <main className="p-10 text-center text-red-500 font-bold text-xl">
        Access Denied. Only developers can view this page.
      </main>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-4">Driver Approval Requests</h2>

      <select
        className="mb-6 px-3 py-2 bg-black border border-gray-600 rounded text-white"
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value as "pending" | "approved" | "rejected")
        }
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {drivers.length === 0 ? (
        <p className="text-gray-400">No {filter} drivers.</p>
      ) : (
        drivers.map((driver) => (
          <div
            key={driver.id}
            className="border border-gray-700 rounded-lg p-4 mb-6 bg-black"
          >
            <p>
              <strong>Name:</strong> {driver.name}
            </p>
            <p>
              <strong>Phone:</strong> {driver.phone}
            </p>
            <p>
              <strong>License:</strong> {driver.licenseNumber}
            </p>
            <p>
              <strong>Service:</strong> {driver.service}
            </p>

            {driver.licenseImageUrl && (
              <Image
                src={driver.licenseImageUrl}
                alt="License"
                width={300}
                height={200}
                className="rounded border mt-2"
              />
            )}

            {driver.priceList && driver.priceList.length > 0 && (
              <div className="mt-3">
                <strong>Prices:</strong>
                <ul className="list-disc pl-6 text-sm">
                  {driver.priceList.map((entry, i) => (
                    <li key={i}>
                      {entry.location}: MUR {entry.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {filter === "pending" && (
              <div className="mt-4">
                <button
                  onClick={() => handleApprove(driver.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                >
                  ✅ Approve
                </button>
                <input
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white mr-2"
                />
                <button
                  onClick={() => handleReject(driver.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            )}

            {filter === "rejected" && (
              <p className="text-red-400 mt-2 text-sm">
                🛑 Reason: {driver.rejectionReason}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
