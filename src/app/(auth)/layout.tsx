import { PageContainer } from "@/components/layout/page-container";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer as="section" className="flex max-w-md flex-col py-16">
      {children}
    </PageContainer>
  );
}
