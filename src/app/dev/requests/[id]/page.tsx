import DriverReviewPageClient from "./ClientPage";

interface PageParams {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageParams) {
  return <DriverReviewPageClient id={params.id} />;
}

export async function generateMetadata({ params }: PageParams) {
  return {
    title: `Driver Approval - ${params.id}`,
  };
}
