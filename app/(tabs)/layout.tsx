import { Shell } from '@/components/layout/Shell';

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}