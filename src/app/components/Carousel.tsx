'use client';

import Link from 'next/link';

interface Service {
  id: string;
  name: string;
}

export default function Carousel({ services }: { services: Service[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2">
      {services.map((service) => (
        <Link key={service.id} href={`/service/${service.id}`}>
          <div className="bg-blue text-gray-900 text-center 
          py-6 px-4 rounded-xl shadow hover:shadow-xl transition 
          cursor-pointer font-semibold text-lg hover:bg-yellow-100">
            {service.name}
          </div>
        </Link>
      ))}
    </div>
  );
}
