import DriverReviewPageClient from "./ClientPage";

interface DriverReviewPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function Page({ params }: DriverReviewPageProps) {
  return <DriverReviewPageClient id={params.id} />;
}

export async function generateMetadata({ params }: DriverReviewPageProps): Promise<{ title: string }> {
  return {
    title: `Driver Review - ${params.id}`,
  };
}
