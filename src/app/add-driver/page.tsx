'use client';

import { useState } from 'react';
import { db, storage } from '@/firebase/firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Tesseract from 'tesseract.js';

interface PriceEntry {
  location: string;
  price: string;
}

interface Driver {
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageUrl?: string;
  verified: boolean;
  priceList: PriceEntry[];
}

interface FormData {
  service: string;
  drivers: Driver[];
}

const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone.trim());
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => console.log(m), // optional: logs OCR progress
  });

  return result.data.text;
};

export default function AddDriverPage() {
  const [formData, setFormData] = useState<FormData>({
    service: '',
    drivers: [
      {
        name: '',
        phone: '',
        licenseNumber: '',
        licenseImageUrl: '',
        verified: false,
        priceList: [{ location: '', price: '' }],
      },
    ],
  });

  const [phoneErrors, setPhoneErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, service: e.target.value });
  };

  const handleDriverChange = (
    index: number,
    field: keyof Driver,
    value: string
  ) => {
    const updated = [...formData.drivers];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    if (field === 'phone') {
      const errors = [...phoneErrors];
      errors[index] = isValidPhoneNumber(value) ? '' : 'Invalid phone';
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
          name: '',
          phone: '',
          licenseNumber: '',
          licenseImageUrl: '',
          verified: false,
          priceList: [{ location: '', price: '' }],
        },
      ],
    });
    setPhoneErrors([...phoneErrors, '']);
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
    updated[driverIndex].priceList.push({ location: '', price: '' });
    setFormData({ ...formData, drivers: updated });
  };

  const removePriceEntry = (driverIndex: number, priceIndex: number) => {
    const updated = [...formData.drivers];
    updated[driverIndex].priceList.splice(priceIndex, 1);
    setFormData({ ...formData, drivers: updated });
  };

  const handleLicenseImageUpload = async (
    driverIndex: number,
    file?: File
  ) => {
    if (!file) return;

    const filePath = `licenses/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const imageText = await extractTextFromImage(file);
    const updated = [...formData.drivers];
    updated[driverIndex].licenseImageUrl = downloadURL;

    const cleanText = imageText.replace(/\s+/g, '').toLowerCase();
    const typedLicense = updated[driverIndex].licenseNumber
      .replace(/\s+/g, '')
      .toLowerCase();

    const licenseMatch = cleanText.includes(typedLicense);

    const nameParts = updated[driverIndex].name.toLowerCase().split(' ');
    const nameMatch = nameParts.every((part) => cleanText.includes(part));

    updated[driverIndex].verified = licenseMatch && nameMatch;

    console.log('🧠 OCR TEXT:', cleanText);
    console.log('✅ License Match:', licenseMatch);
    console.log('✅ Name Match:', nameMatch);

    setFormData({ ...formData, drivers: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasInvalidPhone = formData.drivers.some(
      (d) => !isValidPhoneNumber(d.phone)
    );

    if (hasInvalidPhone) {
      const updatedErrors = formData.drivers.map((d) =>
        isValidPhoneNumber(d.phone) ? '' : 'Invalid phone'
      );
      setPhoneErrors(updatedErrors);
      return;
    }

    setSubmitting(true);
    try {
      for (const driver of formData.drivers) {
        await addDoc(collection(db, 'drivers'), {
          ...driver,
          service: formData.service,
          availability: 'Free',
          ratings: [],
        });
      }

      setSuccessMessage('Drivers added successfully!');
      setFormData({
        service: '',
        drivers: [
          {
            name: '',
            phone: '',
            licenseNumber: '',
            licenseImageUrl: '',
            verified: false,
            priceList: [{ location: '', price: '' }],
          },
        ],
      });
      setPhoneErrors(['']);
    } catch (error) {
      console.error('Error adding drivers:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Add New Driver</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Service Name"
          value={formData.service}
          onChange={handleServiceChange}
          className="w-full p-2 rounded bg-gray-800"
          required
        />

        {formData.drivers.map((driver, driverIndex) => (
          <div
            key={driverIndex}
            className="p-4 mb-4 border border-gray-600 rounded bg-black"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Driver {driverIndex + 1}</h3>
              {formData.drivers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDriver(driverIndex)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Driver Name"
              value={driver.name}
              onChange={(e) =>
                handleDriverChange(driverIndex, 'name', e.target.value)
              }
              className="w-full p-2 rounded bg-gray-800 mb-2"
              required
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={driver.phone}
              onChange={(e) =>
                handleDriverChange(driverIndex, 'phone', e.target.value)
              }
              className={`w-full p-2 rounded bg-gray-800 mb-1 ${
                phoneErrors[driverIndex] ? 'border border-red-500' : ''
              }`}
              required
            />
            {phoneErrors[driverIndex] && (
              <p className="text-red-500 text-sm mb-2">Invalid phone number</p>
            )}

            <input
              type="text"
              placeholder="Driving License Number"
              value={driver.licenseNumber}
              onChange={(e) =>
                handleDriverChange(driverIndex, 'licenseNumber', e.target.value)
              }
              className="w-full p-2 rounded bg-gray-800 mb-2"
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleLicenseImageUpload(driverIndex, e.target.files?.[0])
              }
              className="w-full p-2 bg-gray-900 text-white rounded"
            />

            {driver.verified && (
              <p className="text-green-400 mt-1 text-sm">✅ License Verified</p>
            )}

            <div className="mt-3">
              <label className="block mb-1">Prices</label>
              {driver.priceList.map((entry, priceIndex) => (
                <div key={priceIndex} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Location"
                    value={entry.location}
                    onChange={(e) =>
                      handlePriceChange(
                        driverIndex,
                        priceIndex,
                        'location',
                        e.target.value
                      )
                    }
                    className="flex-1 p-2 rounded bg-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="Price (MUR)"
                    value={entry.price}
                    onChange={(e) =>
                      handlePriceChange(
                        driverIndex,
                        priceIndex,
                        'price',
                        e.target.value
                      )
                    }
                    className="w-28 p-2 rounded bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removePriceEntry(driverIndex, priceIndex)
                    }
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
          {submitting ? 'Submitting...' : 'Add Driver(s)'}
        </button>

        {successMessage && (
          <p className="text-green-400 text-sm mt-2">{successMessage}</p>
        )}
      </form>
    </div>
  );
}
