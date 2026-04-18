"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/firebase/firebase.config";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { Star, Phone, MessageCircle } from "lucide-react";
import { useUser } from "../../../context/Usercontext";

interface Review {
  id: string;
  text: string;
  rating: number;
  reviewerName?: string;
  timestamp: Timestamp;
}

interface PriceEntry {
  location: string;
  price: string;
}

interface Driver {
  id: string;
  name: string;
  service: string;
  phone: string;
  ratings?: number[];
  priceList: PriceEntry[];
}

function StarRow({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} fill={value >= s ? '#facc15' : 'none'} stroke="#facc15" />
      ))}
    </div>
  );
}

export default function DriverPage() {
  const { id } = useParams();
  const { user } = useUser();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    getDoc(doc(db, "drivers", String(id))).then((snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setDriver({
          id: snapshot.id,
          name: d.name,
          service: d.service,
          phone: d.phone,
          ratings: d.ratings || [],
          priceList: d.priceList || [],
        });
      }
    });

    getDocs(collection(db, `drivers/${id}/reviews`)).then((snapshot) => {
      const list: Review[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          rating: data.rating,
          reviewerName: data.reviewerName,
          timestamp: data.timestamp,
        };
      });
      setReviews(list.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
    });
  }, [id]);

  const avg =
    driver?.ratings && driver.ratings.length > 0
      ? driver.ratings.reduce((a, b) => a + b, 0) / driver.ratings.length
      : 0;

  const initials = driver?.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '';

  const handleSubmit = async () => {
    if (!user) return alert("Please log in to leave a review.");
    if (!rating) return alert("Please select a rating.");
    if (!review.trim()) return;
    setSubmitting(true);

    await addDoc(collection(db, `drivers/${id}/reviews`), {
      text: review.trim(),
      rating,
      reviewerName: user.username || user.email,
      timestamp: Timestamp.now(),
    });

    await updateDoc(doc(db, "drivers", String(id)), {
      ratings: [...(driver?.ratings || []), rating],
    });

    setReview("");
    setRating(0);
    setSubmitting(false);
    location.reload();
  };

  const handleDelete = async (reviewId: string, reviewRating: number) => {
    try {
      await deleteDoc(doc(db, `drivers/${id}/reviews`, reviewId));
      const updatedRatings = (driver?.ratings || []).filter((r) => r !== reviewRating);
      await updateDoc(doc(db, "drivers", String(id)), { ratings: updatedRatings });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      alert("Failed to delete the review.");
    }
  };

  if (!driver) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <div className="text-3xl mb-3">🚗</div>
        <p style={{ color: 'var(--muted)' }}>Loading driver...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      {/* Driver header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-5">
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-black"
            style={{ background: 'var(--yellow)' }}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{driver.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {driver.service}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StarRow value={avg} />
              <span className="text-sm" style={{ color: 'var(--yellow)' }}>
                {avg > 0 ? avg.toFixed(1) : 'No ratings'}
              </span>
              {driver.ratings && driver.ratings.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  ({driver.ratings.length} {driver.ratings.length === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={`tel:${driver.phone}`}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <Phone size={15} />
            {driver.phone}
          </a>
          <a
            href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-sm"
            style={{ background: '#25d366' }}
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Price list */}
      {driver.priceList && driver.priceList.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Price List</h2>
          <ul className="space-y-2">
            {driver.priceList.map((price, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg px-4 py-2.5"
                style={{ background: 'var(--surface-2)' }}
              >
                <span>{price.location}</span>
                <span className="font-semibold" style={{ color: 'var(--yellow)' }}>
                  ₹ {price.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review form */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">Leave a Review</h2>
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={24}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setRating(s)}
                  fill={rating >= s ? '#facc15' : 'none'}
                  stroke="#facc15"
                />
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm" style={{ color: 'var(--muted)' }}>
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                </span>
              )}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="input resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !rating || !review.trim()}
              className="btn-primary"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            <a href="/login" style={{ color: 'var(--yellow)' }} className="font-semibold hover:underline">
              Log in
            </a>{' '}
            to leave a review.
          </p>
        )}
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="font-semibold mb-4">
          Reviews{' '}
          {reviews.length > 0 && (
            <span className="ml-1 text-sm font-normal" style={{ color: 'var(--muted)' }}>
              ({reviews.length})
            </span>
          )}
        </h2>

        {reviews.length === 0 ? (
          <div className="card py-10 text-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StarRow value={r.rating} size={14} />
                    </div>
                    <p className="text-sm leading-relaxed">{r.text}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>
                        {r.reviewerName ?? 'Anonymous'}
                      </span>
                      <span>·</span>
                      <span>{r.timestamp?.toDate?.().toLocaleDateString()}</span>
                    </div>
                  </div>
                  {user?.username === r.reviewerName && (
                    <button
                      onClick={() => handleDelete(r.id, r.rating)}
                      className="text-xs flex-shrink-0"
                      style={{ color: 'var(--red)' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
