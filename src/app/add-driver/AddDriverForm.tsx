// File: src/app/add-driver/AddDriverForm.tsx

"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase.config";
import axios from "axios";

interface PriceEntry {
  location: string;
  price: string;
}

interface Driver {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageUrl?: string;
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
  const [formData, setFormData] = useState<FormData>({
    service: "",
    drivers: [
      {
        name: "",
        phone: "",
        licenseNumber: "",
        licenseImageUrl: "",
        priceList: [{ location: "", price: "" }],
        uploading: false,
      },
    ],
  });

  const [phoneErrors, setPhoneErrors] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDriverChange = (
    index: number,
    field: keyof Omit<Driver, "priceList">,
    value: string
  ) => {
    const updated = [...formData.drivers];
    (updated[index][field] as string) = value;

    if (field === "phone") {
      const errors = [...phoneErrors];
      errors[index] = isValidPhoneNumber(value) ? "" : "Invalid phone";
      setPhoneErrors(errors);
    }

    setFormData({ ...formData, drivers: updated });
  };

  const handlePriceChange = (
    driverIndex: number,
    priceIndex: number,
    field: keyof PriceEntry,
    value: string
  ) => {
    const updated = [...formData.drivers];
    updated[driverIndex].priceList[priceIndex][field] = value;
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
          licenseImageUrl: "",
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

  const verifyLicenseWithIDAnalyzer = async (file: File) => {
    const payload = new FormData();
    payload.append("file", file);
    const response = await axios.post("/api/verifyLicence", payload);
    return response.data;
  };

  const handleLicenseImageUpload = async (driverIndex: number, file?: File) => {
    if (!file) return;

    const updated = [...formData.drivers];
    updated[driverIndex].uploading = true;
    setFormData({ ...formData, drivers: updated });

    try {
      const result = await verifyLicenseWithIDAnalyzer(file);

      if (!result?.document?.valid) {
        alert("License verification failed.");
        updated[driverIndex].uploading = false;
        setFormData({ ...formData, drivers: updated });
        return;
      }

      const filePath = `licenses/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      updated[driverIndex].licenseImageUrl = downloadURL;
    } catch (err) {
      console.error("License verification/upload error:", err);
      alert("Verification or upload failed.");
    } finally {
      updated[driverIndex].uploading = false;
      setFormData({ ...formData, drivers: updated });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalidPhone = formData.drivers.some(
      (d) => !isValidPhoneNumber(d.phone)
    );
    const hasUploading = formData.drivers.some((d) => d.uploading);
    const missingImages = formData.drivers.some((d) => !d.licenseImageUrl);

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
      for (const driver of formData.drivers) {
        await addDoc(collection(db, "pendingDrivers"), {
          ...driver,
          service: formData.service,
          status: "pending",
          submittedAt: new Date(),
        });
      }

      setSuccessMessage("Driver(s) submitted for admin approval.");
      setFormData({
        service: "",
        drivers: [
          {
            name: "",
            phone: "",
            licenseNumber: "",
            licenseImageUrl: "",
            priceList: [{ location: "", price: "" }],
            uploading: false,
          },
        ],
      });
      setPhoneErrors([""]);
    } catch (error) {
      console.error("Error submitting drivers:", error);
      alert("Failed to submit drivers.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Request Driver Listing</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Service Name"
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {formData.drivers.map((driver, driverIndex) => (
          <div key={driverIndex} className="p-4 mb-4 border border-gray-600 rounded bg-black">
            <input
              type="text"
              placeholder="Driver Name"
              value={driver.name}
              onChange={(e) => handleDriverChange(driverIndex, "name", e.target.value)}
              className="w-full p-2 rounded bg-gray-800 mb-2"
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={driver.phone}
              onChange={(e) => handleDriverChange(driverIndex, "phone", e.target.value)}
              className={`w-full p-2 rounded bg-gray-800 mb-1 ${
                phoneErrors[driverIndex] ? "border border-red-500" : ""
              }`}
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
              className="w-full p-2 rounded bg-gray-800 mb-2"
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLicenseImageUpload(driverIndex, e.target.files?.[0])}
              className="w-full p-2 bg-gray-900 text-white rounded"
            />

            <div className="mt-3">
              <label className="block mb-1">Prices</label>
              {driver.priceList.map((entry, priceIndex) => (
                <div key={priceIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Location"
                    value={entry.location}
                    onChange={(e) =>
                      handlePriceChange(driverIndex, priceIndex, "location", e.target.value)
                    }
                    className="flex-1 p-2 rounded bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Price (MUR)"
                    value={entry.price}
                    onChange={(e) =>
                      handlePriceChange(driverIndex, priceIndex, "price", e.target.value)
                    }
                    className="w-28 p-2 rounded bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => removePriceEntry(driverIndex, priceIndex)}
                    className="px-2 bg-red-600 rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPriceEntry(driverIndex)}
                className="mt-1 px-4 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300"
              >
                + Add Price
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeDriver(driverIndex)}
              className="mt-4 text-sm text-red-400 hover:underline"
            >
              ✕ Remove This Driver
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addDriver}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          + Add Another Driver
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold"
        >
          {submitting ? "Submitting..." : "Submit for Admin Approval"}
        </button>

        {successMessage && <p className="text-green-400 text-sm mt-2">{successMessage}</p>}
      </form>
    </div>
  );
}
