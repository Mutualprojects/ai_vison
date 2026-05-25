import ClientVision from "@/components/ClientVision";

export default async function ScanPage(props: { params: Promise<{ company: string }> }) {
  const params = await props.params;
  return <ClientVision companySlug={params.company} />;
}
