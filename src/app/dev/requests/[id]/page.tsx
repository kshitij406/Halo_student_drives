import DriverReviewPageClient from "./ClientPage";

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return <DriverReviewPageClient id={params.id} />;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  return {
    title: `Driver Approval - ${params.id}`,
  };
}
