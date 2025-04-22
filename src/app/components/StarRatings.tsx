'use client';

import { useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useUser } from '../../context/Usercontext';

interface ReviewFormProps {
  driverId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ driverId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        driverId,
        rating,
        reviewText,
        reviewerName: user.username || user.email,
        timestamp: Timestamp.now(),
      });

      setReviewText('');
      setRating(0);
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <p className="text-sm text-yellow-400 italic mt-2">
        You must be logged in to leave a review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-400'}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
        placeholder="Write your review..."
        className="w-full bg-gray-800 text-white p-2 rounded"
        required
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
