'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase.config';

// Interface for price data
interface PriceEntry {
  location: string;
  price: string;
}

// Interface for driver data
interface DriverInput {
  name: string;
  phone: string;
  priceList: PriceEntry[];
}

export default function AddDriverPage() {
  const [isServiceMode, setIsServiceMode] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [drivers, setDrivers] = useState<DriverInput[]>([
    { name: 'John Doe', phone: '+230 5123 4567', priceList: [{ location: '', price: '' }] },
  ]);

  // Handle driver input changes
  const handleDriverChange = (
    index: number,
    field: keyof DriverInput, // Field is specifically a key of DriverInput
    value: string
  ) => {
    const updated = [...drivers];
    if (field === 'priceList') {
      // handle priceList separately, if field is 'priceList', do nothing or error handling can be done
      console.error('priceList field cannot be changed directly');
    } else {
      updated[index][field] = value;
    }
    setDrivers(updated);
  };

  // Handle price input changes
  const handlePriceChange = (
    driverIndex: number,
    priceIndex: number,
    field: keyof PriceEntry, // Field is specifically a key of PriceEntry
    value: string
  ) => {
    const updated = [...drivers];
    updated[driverIndex].priceList[priceIndex][field] = value;
    setDrivers(updated);
  };

  // Remove price entry
  const removePrice = (driverIndex: number, priceIndex: number) => {
    const updated = [...drivers];
    updated[driverIndex].priceList.splice(priceIndex, 1);
    setDrivers(updated);
  };

  // Remove driver
  const removeDriver = (index: number) => {
    const updated = [...drivers];
    updated.splice(index, 1);
    setDrivers(updated);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      for (const driver of drivers) {
        await addDoc(collection(db, 'drivers'), {
          ...driver,
          service: serviceName || driver.name,  // If serviceName exists, it will be used; otherwise, use driver name
        });
      }
      alert('Driver(s) added successfully');
    } catch (err) {
      console.error(err); // Logs the error to the console
      alert('Error adding driver');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Become a Driver</h1>

      <div className="mb-4">
        <label className="flex items-center mb-4 gap-2">
          <input
            type="checkbox"
            checked={isServiceMode}
            onChange={() => setIsServiceMode(!isServiceMode)}
            className="mr-2"
          />
          Is this a Service?
        </label>
      </div>

      {/* If Service Mode is enabled, show service name input */}
      {isServiceMode && (
        <div className="mb-4">
          <label>Service Name</label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)} // Handle service name input change
            placeholder="Service Name"
            className="w-full p-2 mb-2 bg-black text-white rounded"
          />
        </div>
      )}

      {drivers.map((driver, index) => (
        <div key={index} className="mb-4 border p-4 rounded-lg bg-gray-800">
          <h3 className="font-bold mb-2">{isServiceMode ? `Driver ${index + 1}` : 'Driver'}</h3>

          {/* Driver Name */}
          <div className="mb-2">
            <label>Driver Name</label>
            <input
              type="text"
              value={driver.name}
              onChange={(e) => handleDriverChange(index, 'name', e.target.value)}
              placeholder="Driver Name"
              className="w-full p-2 mb-2 bg-black text-white rounded"
            />
          </div>

          {/* Phone Number */}
          <div className="mb-2">
            <label>Phone Number</label>
            <input
              type="text"
              value={driver.phone}
              onChange={(e) => handleDriverChange(index, 'phone', e.target.value)}
              placeholder="Phone Number"
              className="w-full p-2 mb-2 bg-black text-white rounded"
            />
          </div>

          {/* Price List */}
          <div className="mb-2">
            <label>Price List</label>
            {driver.priceList.map((price, priceIndex) => (
              <div key={priceIndex} className="flex mb-2 gap-2">
                <input
                  type="text"
                  value={price.location}
                  onChange={(e) => handlePriceChange(index, priceIndex, 'location', e.target.value)}
                  placeholder="Location"
                  className="w-1/2 p-2 bg-black text-white rounded"
                />
                <input
                  type="text"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, priceIndex, 'price', e.target.value)}
                  placeholder="Price"
                  className="w-1/2 p-2 bg-black text-white rounded"
                />
                {driver.priceList.length > 1 && (
                  <button
                    onClick={() => removePrice(index, priceIndex)}
                    className="text-red-500 ml-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                const updated = [...drivers];
                updated[index].priceList.push({ location: '', price: '' });
                setDrivers(updated);
              }}
              className="text-yellow-500"
            >
              + Add Location
            </button>
          </div>

          {/* Remove Driver */}
          <button
            onClick={() => removeDriver(index)}
            className="bg-red-500 text-white p-2 rounded mt-2"
          >
            Remove Driver
          </button>
        </div>
      ))}

      {/* Add Another Driver */}
      <button
        onClick={() => {
          const updated = [...drivers];
          updated.push({ name: '', phone: '', priceList: [{ location: '', price: '' }] });
          setDrivers(updated);
        }}
        className="text-yellow-500 mt-4"
      >
        + Add Another Driver
      </button>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-yellow-500 text-black p-2 rounded mt-4"
      >
        Submit
      </button>
    </div>
  );
}
