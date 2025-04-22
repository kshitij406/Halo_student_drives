'use client';

import { useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc } from 'firebase/firestore';

interface PriceEntry {
  location: string;
  price: string;
}

interface DriverInput {
  name: string;
  phone: string;
  priceList: PriceEntry[];
}

export default function AddDriverPage() {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [drivers, setDrivers] = useState<DriverInput[]>([
    { name: 'John Doe', phone: '+230 5123 4567', priceList: [{ location: '', price: '' }] }
  ]);

  // Handle input changes for drivers
  const handleDriverChange = (index: number, field: keyof DriverInput, value: string) => {
    const updated = [...drivers];
    
    // Assign string values to name or phone
    if (field === "name" || field === "phone") {
      updated[index][field] = value;
    }
    // For priceList, we don't change directly here, but later
    setDrivers(updated);
  };

  // Handle price change for priceList
  const handlePriceChange = (
    driverIndex: number,
    priceIndex: number,
    field: string,
    value: string
  ) => {
    const updated = [...drivers];
    updated[driverIndex].priceList[priceIndex][field as keyof PriceEntry] = value;
    setDrivers(updated);
  };

  // Handle adding a driver
  const handleSubmit = async () => {
    try {
      for (const driver of drivers) {
        await addDoc(collection(db, "drivers"), {
          ...driver,
          service: serviceName || driver.name,
        });
      }
      alert("Driver(s) added successfully");
    } catch (err) {
      console.error(err);  // Logs the error to the console
      alert("Error adding driver");
    }
  };

  // Add driver field dynamically
  const addDriver = () => {
    setDrivers([
      ...drivers,
      { name: '', phone: '', priceList: [{ location: '', price: '' }] },
    ]);
  };

  // Add location input dynamically
  const addLocation = (driverIndex: number) => {
    const updated = [...drivers];
    updated[driverIndex].priceList.push({ location: '', price: '' });
    setDrivers(updated);
  };

  // Delete a location from price list
  const removeLocation = (driverIndex: number, priceIndex: number) => {
    const updated = [...drivers];
    updated[driverIndex].priceList.splice(priceIndex, 1);
    setDrivers(updated);
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Become a Driver</h2>
      <div className="flex items-center mb-4 gap-2">
        <input
          type="checkbox"
          checked={isServiceMode}
          onChange={() => setIsServiceMode(!isServiceMode)}
          className="checkbox"
        />
        <label>Is this a Service?</label>
      </div>

      {isServiceMode && (
        <div className="mb-4">
          <label>Service Name (optional)</label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
            placeholder="e.g. John Rides"
          />
        </div>
      )}

      {drivers.map((driver, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold">Driver {index + 1}</h3>

          <div className="mb-4">
            <label>Driver Name</label>
            <input
              type="text"
              value={driver.name}
              onChange={(e) => handleDriverChange(index, 'name', e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="mb-4">
            <label>Phone Number</label>
            <input
              type="text"
              value={driver.phone}
              onChange={(e) => handleDriverChange(index, 'phone', e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
              placeholder="e.g. +230 5123 4567"
            />
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Price List</h4>
            {driver.priceList.map((price, priceIndex) => (
              <div key={priceIndex} className="flex gap-4 items-center mb-2">
                <input
                  type="text"
                  value={price.location}
                  onChange={(e) => handlePriceChange(index, priceIndex, 'location', e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  placeholder="Location"
                />
                <input
                  type="text"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, priceIndex, 'price', e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 text-white"
                  placeholder="Price"
                />
                <button
                  onClick={() => removeLocation(index, priceIndex)}
                  className="bg-red-500 p-2 rounded text-white"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addLocation(index)}
              className="bg-yellow-500 p-2 rounded text-black"
            >
              + Add Location
            </button>
          </div>

          <hr className="my-4" />
        </div>
      ))}

      <button
        onClick={addDriver}
        className="bg-yellow-500 p-2 rounded text-black mb-4"
      >
        + Add Another Driver
      </button>

      <button
        onClick={handleSubmit}
        className="bg-yellow-500 p-4 rounded text-black"
      >
        Submit
      </button>
    </div>
  );
}
