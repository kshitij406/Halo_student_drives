"use client";

import { useState } from "react";
import { db } from "@/firebase/firebase.config";
import { collection, addDoc } from "firebase/firestore";
import { useUser } from "@/context/Usercontext";
import { Plus, Trash2 } from "lucide-react";

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

const isValidPhoneNumber = (phone: string): boolean =>
  /^\+?\d{10,15}$/.test(phone.trim());

function emptyDriver(): Driver {
  return {
    name: "",
    phone: "",
    licenseNumber: "",
    licenseImageBase64: "",
    priceList: [{ location: "", price: "" }],
    uploading: false,
  };
}

export default function AddDriverForm() {
  const { user } = useUser();
  const [formData, setFormData] = useState<FormData>({
    service: "",
    drivers: [emptyDriver()],
  });
  const [phoneErrors, setPhoneErrors] = useState<string[]>([""])
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateDrivers = (updated: Driver[]) =>
    setFormData((f) => ({ ...f, drivers: updated }));

  const handleDriverChange = (
    index: number,
    field: keyof Omit<Driver, "priceList">,
    value: string
  ) => {
    const updated = [...formData.drivers];
    (updated[index][field] as string) = value;
    if (field === "phone") {
      const errors = [...phoneErrors];
      errors[index] = isValidPhoneNumber(value) ? "" : "Invalid phone number";
      setPhoneErrors(errors);
    }
    updateDrivers(updated);
  };

  const handlePriceChange = (
    driverIdx: number,
    priceIdx: number,
    field: keyof PriceEntry,
    value: string
  ) => {
    const updated = [...formData.drivers];
    updated[driverIdx].priceList[priceIdx][field] = value;
    updateDrivers(updated);
  };

  const addPriceEntry = (driverIdx: number) => {
    const updated = [...formData.drivers];
    updated[driverIdx].priceList.push({ location: "", price: "" });
    updateDrivers(updated);
  };

  const removePriceEntry = (driverIdx: number, priceIdx: number) => {
    const updated = [...formData.drivers];
    updated[driverIdx].priceList.splice(priceIdx, 1);
    updateDrivers(updated);
  };

  const addDriver = () => {
    updateDrivers([...formData.drivers, emptyDriver()]);
    setPhoneErrors([...phoneErrors, ""]);
  };

  const removeDriver = (index: number) => {
    updateDrivers(formData.drivers.filter((_, i) => i !== index));
    setPhoneErrors(phoneErrors.filter((_, i) => i !== index));
  };

  const handleLicenseImageUpload = (driverIndex: number, file?: File) => {
    if (!file) return;
    const updated = [...formData.drivers];
    updated[driverIndex].uploading = true;
    updateDrivers(updated);

    const reader = new FileReader();
    reader.onloadend = () => {
      const up2 = [...formData.drivers];
      up2[driverIndex].licenseImageBase64 = (reader.result as string).split(",")[1];
      up2[driverIndex].uploading = false;
      updateDrivers(up2);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");

    if (formData.drivers.some((d) => d.uploading)) {
      alert("Please wait for image uploads to finish.");
      return;
    }
    if (formData.drivers.some((d) => !d.licenseImageBase64)) {
      alert("Each driver must have a license image.");
      return;
    }
    if (formData.drivers.some((d) => !isValidPhoneNumber(d.phone))) {
      setPhoneErrors(
        formData.drivers.map((d) =>
          isValidPhoneNumber(d.phone) ? "" : "Invalid phone number"
        )
      );
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
      setSuccess(true);
      setFormData({ service: "", drivers: [emptyDriver()] });
      setPhoneErrors([""]);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Register as a Driver</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Submit your details for admin review. You&apos;ll be listed once approved.
        </p>
      </div>

      {success && (
        <div
          className="mb-6 rounded-xl px-5 py-4 text-sm font-medium"
          style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.25)' }}
        >
          Submitted for admin approval. You&apos;ll be listed once reviewed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service name */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Service Name</label>
          <input
            type="text"
            placeholder="e.g. Campus Rides, Airport Transfers"
            value={formData.service}
            onChange={(e) => setFormData((f) => ({ ...f, service: e.target.value }))}
            className="input"
            required
          />
        </div>

        {/* Drivers */}
        {formData.drivers.map((driver, driverIdx) => (
          <div
            key={driverIdx}
            className="card p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--muted)' }}>
                Driver {driverIdx + 1}
              </h3>
              {formData.drivers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDriver(driverIdx)}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--red)' }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Driver name"
              value={driver.name}
              onChange={(e) => handleDriverChange(driverIdx, "name", e.target.value)}
              className="input"
              required
            />

            <div>
              <input
                type="tel"
                placeholder="Phone number (e.g. +23052000000)"
                value={driver.phone}
                onChange={(e) => handleDriverChange(driverIdx, "phone", e.target.value)}
                className={`input ${phoneErrors[driverIdx] ? 'error' : ''}`}
                required
              />
              {phoneErrors[driverIdx] && (
                <p className="mt-1 text-xs" style={{ color: 'var(--red)' }}>
                  {phoneErrors[driverIdx]}
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="License number"
              value={driver.licenseNumber}
              onChange={(e) => handleDriverChange(driverIdx, "licenseNumber", e.target.value)}
              className="input"
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--muted)' }}>
                License photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLicenseImageUpload(driverIdx, e.target.files?.[0])}
                className="input py-2 text-sm"
                style={{ color: 'var(--muted)', cursor: 'pointer' }}
              />
              {driver.uploading && (
                <p className="mt-1 text-xs" style={{ color: 'var(--yellow)' }}>
                  Processing image...
                </p>
              )}
              {driver.licenseImageBase64 && !driver.uploading && (
                <p className="mt-1 text-xs" style={{ color: 'var(--green)' }}>
                  Image uploaded
                </p>
              )}
            </div>

            {/* Price list */}
            <div>
              <label className="mb-2 block text-sm font-semibold">Prices</label>
              <div className="space-y-2">
                {driver.priceList.map((entry, priceIdx) => (
                  <div key={priceIdx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Location"
                      value={entry.location}
                      onChange={(e) => handlePriceChange(driverIdx, priceIdx, "location", e.target.value)}
                      className="input flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={entry.price}
                      onChange={(e) => handlePriceChange(driverIdx, priceIdx, "price", e.target.value)}
                      className="input w-28"
                    />
                    {driver.priceList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePriceEntry(driverIdx, priceIdx)}
                        className="flex-shrink-0 rounded-lg p-2 transition-colors"
                        style={{ color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        title="Remove price"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addPriceEntry(driverIdx)}
                className="btn-ghost mt-2 gap-1.5 text-sm"
              >
                <Plus size={14} /> Add price
              </button>
            </div>
          </div>
        ))}

        {/* Add driver */}
        <button
          type="button"
          onClick={addDriver}
          className="btn-ghost w-full gap-2"
        >
          <Plus size={15} /> Add Another Driver
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || formData.drivers.some((d) => d.uploading)}
          className="btn-primary w-full py-3"
        >
          {submitting ? "Submitting..." : "Submit for Approval"}
        </button>
      </form>
    </div>
  );
}
