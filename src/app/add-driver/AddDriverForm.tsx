"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { useUser } from "@/context/Usercontext";
import Image from 'next/image';

interface PriceEntry {
  location: string;
  price: string;
}

interface Driver {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageBase64?: string;
  priceList: PriceEntry[];
  uploading: boolean;
}

interface FormData {
  service: string;
  drivers: Driver[];
}

const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone.trim());
};

export default function AddDriverForm() {
  const { user } = useUser();
  const [formData, setFormData] = useState<FormData>({
    service: "",
    drivers: [
      {
        name: "",
        phone: "",
        licenseNumber: "",
        licenseImageBase64: "",
        priceList: [{ location: "", price: "" }],
        uploading: false,
      },
    ],
  });

  const [phoneErrors, setPhoneErrors] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDriverChange = (index: number, field: keyof Omit<Driver, "priceList">, value: string) => {
    const updated = [...formData.drivers];
    (updated[index][field] as string) = value;

    if (field === "phone") {
      const errors = [...phoneErrors];
      errors[index] = isValidPhoneNumber(value) ? "" : "Invalid phone";
      setPhoneErrors(errors);
    }

    setFormData({ ...formData, drivers: updated });
  };

  const handlePriceChange = (driverIndex: number, priceIndex: number, field: keyof PriceEntry, value: string) => {
    const updated = [...formData.drivers];
    updated[driverIndex].priceList[priceIndex][field] = value;
    setFormData({ ...formData, drivers: updated });
  };

  const addPriceEntry = (driverIndex: number) => {
    const updated = [...formData.drivers];
    updated[driverIndex].priceList.push({ location: "", price: "" });
    setFormData({ ...formData, drivers: updated });
  };

  const removePriceEntry = (driverIndex: number, priceIndex: number) => {
    const updated = [...formData.drivers];
    updated[driverIndex].priceList.splice(priceIndex, 1);
    setFormData({ ...formData, drivers: updated });
  };

  const addDriver = () => {
    setFormData({
      ...formData,
      drivers: [
        ...formData.drivers,
        {
          name: "",
          phone: "",
          licenseNumber: "",
          licenseImageBase64: "",
          priceList: [{ location: "", price: "" }],
          uploading: false,
        },
      ],
    });
    setPhoneErrors([...phoneErrors, ""]);
  };

  const removeDriver = (index: number) => {
    setFormData({
      ...formData,
      drivers: formData.drivers.filter((_, i) => i !== index),
    });
    setPhoneErrors(phoneErrors.filter((_, i) => i !== index));
  };

  const handleLicenseImageUpload = (driverIndex: number, file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadstart = () => {
      const updated = [...formData.drivers];
      updated[driverIndex].uploading = true;
      setFormData({ ...formData, drivers: updated });
    };

    reader.onloadend = () => {
      const updated = [...formData.drivers];
      updated[driverIndex].licenseImageBase64 = (reader.result as string).split(",")[1];
      updated[driverIndex].uploading = false;
      setFormData({ ...formData, drivers: updated });
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit drivers.");

    const hasInvalidPhone = formData.drivers.some((d) => !isValidPhoneNumber(d.phone));
    const hasUploading = formData.drivers.some((d) => d.uploading);
    const missingImages = formData.drivers.some((d) => !d.licenseImageBase64);

    if (hasUploading) {
      alert("Please wait for all image uploads to finish.");
      return;
    }

    if (missingImages) {
      alert("Each driver must have a license image.");
      return;
    }

    if (hasInvalidPhone) {
      const updatedErrors = formData.drivers.map((d) =>
        isValidPhoneNumber(d.phone) ? "" : "Invalid phone"
      );
      setPhoneErrors(updatedErrors);
      return;
    }

    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cleanDrivers = formData.drivers.map(({ uploading, ...rest }) => rest);

      await addDoc(collection(db, "pendingServices"), {
        service: formData.service,
        drivers: cleanDrivers,
        status: "pending",
        submittedAt: new Date().toISOString(),
        ownerEmail: user.email,
      });

      setSuccessMessage("Service and drivers submitted for admin approval.");
      setSubmitting(false);
      setFormData({
        service: "",
        drivers: [
          {
            name: "",
            phone: "",
            licenseNumber: "",
            licenseImageBase64: "",
            priceList: [{ location: "", price: "" }],
            uploading: false,
          },
        ],
      });
      setPhoneErrors([""]);
    } catch (error: unknown) {
      console.error("Error submitting service and drivers:", error);
      if (error instanceof Error) {
        alert(`Failed to submit service and drivers. ${error.message}`);
      } else {
        alert("Failed to submit service and drivers.");
      }
    }
    
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <div className="flex justify-center">
      <div className="flex items-center">
      <Image
        className="object-contain"
        src="/white-car-transparent.png"
        alt="Logo"
        width={150}
        height={150}
      />
      <h2 className="text-2xl font-bold text-center">Create Your Driver Profile</h2>
      </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Service Name"
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full pl-10 pr-4 py-3 rounded border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            
          required
        />

        {formData.drivers.map((driver, driverIndex) => (
          <div key={driverIndex} className="p-4 mb-4 border border-gray-600 rounded bg-black">
            <input
              type="text"
              placeholder="Driver Name"
              value={driver.name}
              onChange={(e) => handleDriverChange(driverIndex, "name", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={driver.phone}
              onChange={(e) => handleDriverChange(driverIndex, "phone", e.target.value)}
              className={`w-full py-3 pl-10 pr-4 mt-4 rounded border border-gray-700 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${phoneErrors[driverIndex] ? "focus:ring-0 border-2 border-red-500" : ""}`}
              required
            />
            {phoneErrors[driverIndex] && (
              <p className="text-red-500 text-sm mb-2">Invalid phone number</p>
            )}
            <input
              type="text"
              placeholder="License Number"
              value={driver.licenseNumber}
              onChange={(e) => handleDriverChange(driverIndex, "licenseNumber", e.target.value)}
              className="w-full py-3 pl-10 pr-4 mt-4 rounded black mb-2 border border-gray-700"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLicenseImageUpload(driverIndex, e.target.files?.[0])}
              className="w-full p-2 bg-gray-900 text-white rounded"
            />
            {driver.uploading && (
              <p className="text-yellow-400 text-sm mt-1">Processing license image...</p>
            )}

            <div className="mt-6 w-full">
              <label className="block mb-2 font-bold">Prices</label>
              {driver.priceList.map((entry, priceIndex) => (
                <div key={priceIndex} className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Location"
                    value={entry.location}
                    onChange={(e) => handlePriceChange(driverIndex, priceIndex, "location", e.target.value)}
                    className="w-full md:flex-1 p-2 rounded bg-black border border-gray-700 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Price (MUR)"
                    value={entry.price}
                    onChange={(e) => handlePriceChange(driverIndex, priceIndex, "price", e.target.value)}
                    className="w-full md:w-28 p-2 rounded bg-black border border-gray-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removePriceEntry(driverIndex, priceIndex)}
                    className="w-full md:w-auto px-4 py-2 bg-yellow-500 rounded hover:bg-red-700 font-bold text-black hover:text-white"
                  >
                    Remove Price
                  </button>
                </div>
                
              ))}

              <button
                type="button"
                onClick={() => addPriceEntry(driverIndex)}
                className="w-full py-2 mt-1 bg-yellow-500 font-bold rounded text-black hover:bg-yellow-300"
              >
                Add Price
              </button>
            </div>


            <button
              type="button"
              onClick={() => removeDriver(driverIndex)}
              className="w-full mt-2 text-center py-2 bg-yellow-500 text-black font-bold rounded hover:bg-red-700 hover:text-white"
            >
               Remove This Driver
            </button>
          </div>
        ))}
      <div className="text-center flex space-x-1 justify-center">
        <button
          type="button"
          onClick={addDriver}
          className=" w-full bg-yellow-500 hover:bg-yellow-300 text-black font-bold  rounded"
        >
          + Add Another Driver
        </button>
        <button
          type="submit"
          disabled={submitting || formData.drivers.some((d) => d.uploading)}
          className={`bg-yellow-500 text-black w-full py-2 rounded font-semibold ${
            submitting || formData.drivers.some((d) => d.uploading)
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 hover:text-white"
          }`}
        >
          {submitting ? "Submitting..." : "Submit for Admin Approval"}
        </button>
        </div>

        {successMessage && <p className="text-green-400 font-bold text-center text-sm mt-2">{successMessage}</p>}
      </form>
    </div>
  );
}
