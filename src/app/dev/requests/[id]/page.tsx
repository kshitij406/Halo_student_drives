import { Metadata } from "next";
import DriverReviewPageClient from "./ClientPage";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Driver Review - ${params.id}`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <DriverReviewPageClient id={params.id} />;
}
