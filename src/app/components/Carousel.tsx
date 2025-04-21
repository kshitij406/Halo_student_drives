'use client';

import Link from 'next/link';

interface Props {
  services: { id: string; name: string }[];
}

export default function Carousel({ services }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map((service) => (
        <Link key={service.id} href={`/service/${service.id}`}>
          <div className="bg-blue text-gray-900 text-center py-6 px-4 rounded-xl shadow hover:shadow-xl transition cursor-pointer font-semibold text-lg hover:bg-yellow-500">
            {service.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
