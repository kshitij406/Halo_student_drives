"use client";

import { getDoc, doc, deleteDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/firebase.config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/Usercontext";
import Image from "next/image";

interface Driver {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageBase64?: string;
  service: string;
  priceList?: { location: string; price: string }[];
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export default function DriverReviewPageClient({ id }: { id: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const ref = doc(db, "pendingDrivers", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDriver(snap.data() as Driver);
        } else {
          router.push("/dev/requests"); // redirect if driver not found
        }
      } catch (err) {
        console.error("Error fetching driver:", err);
      }
    };
    fetchDriver();
  }, [id, router]); // ✅ include router here
  
  

  const handleApprove = async () => {
    if (!driver) return;
    const driversRef = collection(db, "drivers");
    const docRef = await addDoc(driversRef, {
      ...driver,
      approved: true,
      availability: "Free",
      ratings: [],
    });
    await updateDoc(docRef, { id: docRef.id }); // ✅ add ID to doc
    await deleteDoc(doc(db, "pendingDrivers", id));
    router.push("/dev/requests");
  };
  

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert("Please enter a reason.");
    const ref = doc(db, "pendingDrivers", id);
    await updateDoc(ref, {
      status: "rejected",
      rejectionReason: rejectReason,
    });
    router.push("/dev/requests");
  };

  if (user?.role !== "dev") {
    return (
      <main className="p-10 text-red-500 font-bold text-xl text-center">
        Access Denied
      </main>
    );
  }

  if (!driver)
    return <main className="p-10 text-gray-400 text-center">Loading...</main>;

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Review Driver Profile</h2>
      <div className="border border-gray-600 bg-black p-4 rounded">
        <p><strong>Name:</strong> {driver.name}</p>
        <p><strong>Phone:</strong> {driver.phone}</p>
        <p><strong>License:</strong> {driver.licenseNumber}</p>
        <p><strong>Service:</strong> {driver.service}</p>

        {driver.licenseImageBase64 && (
          <div className="mt-2">
            <strong>License Image:</strong>
            <Image
              src={`data:image/png;base64,${driver.licenseImageBase64}`}
              alt="License Preview"
              width={300}
              height={200}
              className="mt-2 w-full max-w-xs border rounded"
            />
          </div>
        )}

        {driver.priceList && (
          <div className="mt-3">
            <strong>Prices:</strong>
            <ul className="list-disc pl-6 text-sm">
              {driver.priceList.map((entry, i) => (
                <li key={i}>{entry.location}: MUR {entry.price}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleApprove}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-3"
          >
            ✅ Approve
          </button>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            className="bg-gray-800 border border-gray-600 px-3 py-1 rounded mr-2 text-white"
          />
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
}
