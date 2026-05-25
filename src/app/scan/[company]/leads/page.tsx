import LeadsDashboard from "@/components/LeadsDashboard";

export default async function LeadsPage(props: { params: Promise<{ company: string }> }) {
  const params = await props.params;
  return <LeadsDashboard companySlug={params.company} />;
}
