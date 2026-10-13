import { SignatureDetail } from "@/src/components/app/signature-detail";

export default async function SignatureDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SignatureDetail signatureId={id} />;
}
