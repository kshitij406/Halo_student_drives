"use client";

import { getDoc, doc, deleteDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/firebase.config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/Usercontext";
import Image from "next/image";
import LoadingScreen from "../../../components/LoadingScreen";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Show loader on initial load

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const ref = doc(db, "pendingDrivers", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setDriver(snap.data() as Driver);
        } else {
          router.push("/dev/requests");
        }
      } catch (err) {
        console.error("Error fetching driver:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriver();
  }, [id, router]);

  const handleApprove = async () => {
    if (!driver) return;
    setIsSubmitting(true);
    try {
      const driversRef = collection(db, "drivers");
      const docRef = await addDoc(driversRef, {
        ...driver,
        approved: true,
        availability: "Free",
        ratings: [],
      });
      await updateDoc(docRef, { id: docRef.id });
      await deleteDoc(doc(db, "pendingDrivers", id));
      router.push("/dev/requests");
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      const ref = doc(db, "pendingDrivers", id);
      await updateDoc(ref, {
        status: "rejected",
        rejectionReason: rejectReason,
      });
      router.push("/dev/requests");
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user === undefined || isLoading || isSubmitting) {
    return <LoadingScreen show={true} />;
  }

  // Access control
  if (user?.role !== "dev") {
    return (
      <main className="p-10 text-red-500 font-bold text-xl text-center">
        Access Denied
      </main>
    );
  }

  // Driver not found
  if (!driver) {
    return (
      <main className="p-10 text-red-500 font-bold text-xl text-center">
        Driver not found
      </main>
    );
  }

  // Page content
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
            disabled={isSubmitting}
          >
            ✅ Approve
          </button>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
            className="bg-gray-800 border border-gray-600 px-3 py-1 rounded mr-2 text-white"
            disabled={isSubmitting}
          />
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            disabled={isSubmitting}
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
}
