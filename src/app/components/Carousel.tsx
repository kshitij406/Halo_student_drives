'use client';

import Link from 'next/link';

interface Props {
  services: { id: string; name: string }[];
}

export default function Carousel({ services }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/service/${service.id}`}
          className="bg-white text-center py-6 px-4 rounded shadow hover:bg-yellow-100 font-semibold"
        >
          {service.name}
        </Link>
      ))}
    </div>
  );
}
