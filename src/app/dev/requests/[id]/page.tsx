import DriverReviewPageClient from "./ClientPage";

interface PageProps {
  params: { id: string };
  searchParams?: Record<string, string>;
}

export default function Page({ params }: PageProps) {
  return <DriverReviewPageClient id={params.id} />;
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Driver Approval - ${params.id}`,
  };
}
