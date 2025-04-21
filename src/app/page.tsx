import Carousel from "./components/Carousel";

interface Service {
  id: string;
  name: string;
}

const services: Service[] = [
  { id: "viva-rides", name: "Viva Rides" },
  { id: "fast-go", name: "Fast Go" },
];

export default function Home() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Student Rides</h1>
      <p className="text-gray-600 mb-6">Find a ride service below:</p>
      <Carousel services={services} />
    </main>
  );
}
