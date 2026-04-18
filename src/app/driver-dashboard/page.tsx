"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/Usercontext";
import { db } from "@/firebase/firebase.config";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseImageBase64?: string;
  priceList: { location: string; price: string }[];
  availability?: "Free" | "Busy";
}

function AvailabilityToggle({
  value,
  onChange,
}: {
  value: "Free" | "Busy";
  onChange: (val: "Free" | "Busy") => void;
}) {
  const isFree = value === "Free";
  return (
    <button
      type="button"
      onClick={() => onChange(isFree ? "Busy" : "Free")}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
      style={
        isFree
          ? { background: 'rgba(34,197,94,0.15)', color: 'var(--green)' }
          : { background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }
      }
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: isFree ? 'var(--green)' : 'var(--red)' }}
      />
      {value}
    </button>
  );
}

export default function DriverDashboard() {
  const { user } = useUser();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedDrivers, setEditedDrivers] = useState<Record<string, Partial<Driver>>>({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "drivers"), where("ownerEmail", "==", user.email));
    getDocs(q)
      .then((snap) => {
        setDrivers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Driver, "id">) })));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const patch = <K extends keyof Driver>(id: string, field: K, value: Driver[K]) =>
    setEditedDrivers((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const patchPrice = (driverId: string, i: number, field: "location" | "price", value: string) => {
    const base = drivers.find((d) => d.id === driverId);
    if (!base) return;
    const list = [...(editedDrivers[driverId]?.priceList ?? base.priceList)];
    list[i] = { ...list[i], [field]: value };
    patch(driverId, "priceList", list);
  };

  const addPrice = (driverId: string) => {
    const base = drivers.find((d) => d.id === driverId);
    if (!base) return;
    const list = [...(editedDrivers[driverId]?.priceList ?? base.priceList), { location: "", price: "" }];
    patch(driverId, "priceList", list);
  };

  const removePrice = (driverId: string, i: number) => {
    const base = drivers.find((d) => d.id === driverId);
    if (!base) return;
    const list = [...(editedDrivers[driverId]?.priceList ?? base.priceList)];
    list.splice(i, 1);
    patch(driverId, "priceList", list);
  };

  const save = async (driverId: string) => {
    const edits = editedDrivers[driverId];
    if (!edits) return;
    await updateDoc(doc(db, "drivers", driverId), edits);
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, ...edits } : d)));
    setEditedDrivers((prev) => { const n = { ...prev }; delete n[driverId]; return n; });
    toast.success("Saved");
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "drivers", id));
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    toast.success("Driver removed");
  };

  if (!user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>Please log in to access your dashboard.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Driver Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Manage your driver profiles and availability.
        </p>
      </div>

      {loading ? (
        <div className="card py-12 text-center" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : drivers.length === 0 ? (
        <div className="card py-12 text-center">
          <p style={{ color: 'var(--muted)' }}>No drivers found. Your submissions may still be pending approval.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {drivers.map((driver) => {
            const edits = editedDrivers[driver.id] ?? {};
            const current = { ...driver, ...edits };
            const isDirty = Object.keys(edits).length > 0;

            return (
              <div key={driver.id} className="card p-6 space-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-lg">{driver.name}</h2>
                  <div className="flex items-center gap-2">
                    <AvailabilityToggle
                      value={current.availability ?? "Free"}
                      onChange={(val) => patch(driver.id, "availability", val)}
                    />
                    <button
                      onClick={() => remove(driver.id)}
                      className="rounded-lg p-2 transition-colors"
                      style={{ color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      title="Remove driver"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Name</label>
                    <input
                      className="input"
                      value={current.name}
                      onChange={(e) => patch(driver.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Phone</label>
                    <input
                      className="input"
                      value={current.phone}
                      onChange={(e) => patch(driver.id, "phone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Prices */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Prices</label>
                  <div className="space-y-2">
                    {current.priceList.map((entry, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className="input flex-1"
                          placeholder="Location"
                          value={entry.location}
                          onChange={(e) => patchPrice(driver.id, i, "location", e.target.value)}
                        />
                        <input
                          className="input w-24"
                          placeholder="Price"
                          value={entry.price}
                          onChange={(e) => patchPrice(driver.id, i, "price", e.target.value)}
                        />
                        <button
                          onClick={() => removePrice(driver.id, i)}
                          className="rounded-lg p-2 flex-shrink-0"
                          style={{ color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addPrice(driver.id)}
                    className="btn-ghost mt-2 gap-1.5 text-sm"
                  >
                    <Plus size={14} /> Add price
                  </button>
                </div>

                {/* Save */}
                {isDirty && (
                  <button
                    onClick={() => save(driver.id)}
                    className="btn-primary gap-2 text-sm"
                  >
                    <Save size={14} /> Save changes
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
