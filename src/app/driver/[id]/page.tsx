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
} from "firebase/firestore";
import { Star } from "lucide-react";

interface Review {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
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

export default function DriverPage() {
  const { id } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchDriver = async () => {
      const ref = doc(db, "drivers", String(id));
      const snapshot = await getDoc(ref);
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
    };

    const fetchReviews = async () => {
      const snapshot = await getDocs(collection(db, `drivers/${id}/reviews`));
      const list: Review[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          rating: data.rating,
          createdAt: data.createdAt || "",
        };
      });
      setReviews(list);
    };

    fetchDriver();
    fetchReviews();
  }, [id]);

  const avgRating =
    driver?.ratings && driver.ratings.length > 0
      ? driver.ratings.reduce((a, b) => a + b, 0) / driver.ratings.length
      : 0;

  const handleSubmit = async () => {
    if (!rating) return alert("Please give a rating.");

    const reviewData = {
      text: review.trim(),
      rating,
      createdAt: new Date().toLocaleString(),
    };

    await addDoc(collection(db, `drivers/${id}/reviews`), reviewData);

    // Add the rating to the driver's ratings in Firestore
    await updateDoc(doc(db, "drivers", String(id)), {
      ratings: [...(driver?.ratings || []), rating],
    });

    setReview("");
    setRating(0);
    window.location.reload();
  };

  const handleDelete = async (reviewId: string, reviewRating: number) => {
    try {
      // Delete the review from Firestore
      await deleteDoc(doc(db, `drivers/${id}/reviews`, reviewId));

      // Update the driver's ratings array in Firestore by removing the deleted rating
      const updatedRatings = (driver?.ratings || []).filter(
        (rating) => rating !== reviewRating
      );

      // Update the driver's document in Firestore with the new ratings array
      await updateDoc(doc(db, "drivers", String(id)), {
        ratings: updatedRatings,
      });

      // Update the reviews state to remove the deleted review
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete the review.");
    }
  };

  if (!driver) return <p className="text-white p-6">Loading driver...</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-2">{driver.name}</h1>
      <p className="mb-1">Service: {driver.service}</p>
      <p className="mb-4">Phone: {driver.phone}</p>

      <div className="flex items-center gap-2 mt-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            fill={avgRating >= star ? "#facc15" : "none"}
            stroke="#facc15"
          />
        ))}
        <span className="text-sm text-yellow-400">{avgRating.toFixed(1)}</span>
      </div>

      {/* Display Price List */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Price List</h2>
        {driver.priceList && driver.priceList.length > 0 ? (
          <ul className="space-y-2">
            {driver.priceList.map((price, index) => (
              <li
                key={index}
                className="flex justify-between text-lg text-yellow-500"
              >
                <span className="text-white">{price.location}</span>
                <span className="text-white">₹ {price.price}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No price information available.</p>
        )}
      </div>

      {/* Review Submission */}
      <div className="bg-white text-black p-4 rounded shadow mb-6">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={20}
              className="cursor-pointer"
              onClick={() => setRating(s)}
              fill={rating >= s ? "#facc15" : "none"}
              stroke="#facc15"
            />
          ))}
        </div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Leave a review..."
          className="w-full border border-gray-300 p-2 rounded mb-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-yellow-500 px-4 py-2 text-black font-bold rounded hover:bg-yellow-600"
        >
          Submit Review
        </button>
      </div>

      {/* Show Reviews */}
      <div className="space-y-4 mt-6">
        <h2 className="text-xl font-semibold mb-2">User Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-300">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-gray-800 text-white p-3 rounded shadow"
            >
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={r.rating >= s ? "#facc15" : "none"}
                    stroke="#facc15"
                  />
                ))}
              </div>
              <p className="text-sm">{r.text}</p>
              <p className="text-xs text-gray-400 mt-1">{r.createdAt}</p>
              <button
                onClick={() => handleDelete(r.id, r.rating)}
                className="text-red-400 text-xs mt-1 underline"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
