'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Star } from 'lucide-react';

interface Review {
  id?: string;
  text?: string;
  name: string;
  rating: number;
  timestamp?: Date;
  userId: string;
}

interface Props {
  driverId: string;
}

export default function ReviewForm({ driverId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // 👤 Fake guest user ID (for now, remove login restriction)
  const user = { uid: 'guest-user' };

  useEffect(() => {
    const fetchReviews = async () => {
      const reviewSnapshot = await getDocs(
        collection(db, 'reviews', driverId, 'userReviews')
      );
      const fetched: Review[] = reviewSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          name: data.name || 'Anonymous',
          rating: data.rating || 0,
          userId: data.userId,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        };
      });

      fetched.sort((a, b) =>
        (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
      );

      setReviews(fetched);
      setLoading(false);
    };

    fetchReviews();
  }, [driverId]);

  const handleSubmit = async () => {
    if (rating === 0) return alert('Please select a rating');

    const newReview: Review = {
      name: anonymous ? 'Anonymous' : 'User',
      rating,
      text: text.trim() !== '' ? text : '',
      timestamp: new Date(),
      userId: user?.uid || 'guest-user',
    };

    await addDoc(collection(db, 'reviews', driverId, 'userReviews'), {
      ...newReview,
      timestamp: serverTimestamp(),
    });

    setReviews([newReview, ...reviews]);
    setText('');
    setRating(0);
    setHovered(null);
    setAnonymous(false);
  };

  const handleDelete = async (reviewId: string) => {
    const ref = doc(db, 'reviews', driverId, 'userReviews', reviewId);
    await deleteDoc(ref);
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <div className="mt-6">
      <p className="text-gray-700 font-medium mb-1">Average Rating:</p>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            fill={averageRating >= star ? '#facc15' : 'none'}
            stroke="#facc15"
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {averageRating.toFixed(1)}
        </span>
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">User Reviews</h3>
      {loading ? (
        <p>Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 mb-4">No reviews yet.</p>
      ) : (
        <div className="space-y-3 mb-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-100 p-3 rounded shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                {review.name} • {review.timestamp?.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={review.rating >= star ? '#facc15' : 'none'}
                    stroke="#facc15"
                  />
                ))}
              </div>
              {review.text && <div className="text-black">{review.text}</div>}
              {review.userId === user?.uid && (
                <button
                  onClick={() => handleDelete(review.id!)}
                  className="text-red-600 text-sm mt-2 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className="cursor-pointer transition"
            fill={(hovered ?? rating) >= star ? '#facc15' : 'none'}
            stroke="#facc15"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <textarea
        className="w-full border rounded p-2 text-black"
        placeholder="Leave a review..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />

      <div className="flex items-center gap-2 my-2">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        <label className="text-sm text-gray-600">Post as anonymous</label>
      </div>

      <button
        onClick={handleSubmit}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
      >
        Submit
      </button>
    </div>
  );
}
