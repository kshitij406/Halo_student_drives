'use client';

import { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase/firebase.config';
import { Star } from 'lucide-react';

interface StarRatingProps {
  driverId: string;
  currentRatings?: number[];
  onRated?: () => void; // optional callback to refresh
}

export default function StarRating({ driverId, currentRatings = [], onRated }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const averageRating =
    currentRatings.length > 0
      ? (currentRatings.reduce((a, b) => a + b, 0) / currentRatings.length).toFixed(1)
      : 'No ratings yet';

  const handleRate = async (rating: number) => {
    setSelected(rating);
    try {
      const ref = doc(db, 'drivers', driverId);
      await updateDoc(ref, {
        ratings: arrayUnion(rating),
      });
      if (onRated) onRated(); // refresh ratings
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-400 mb-1">
        Average Rating:{' '}
        <span className="font-medium text-white">{averageRating}</span>
      </p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`cursor-pointer transition-colors ${
              (hovered ?? selected ?? 0) >= star ? 'text-yellow-500' : 'text-gray-400'
            }`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleRate(star)}
          />
        ))}
      </div>
    </div>
  );
}
