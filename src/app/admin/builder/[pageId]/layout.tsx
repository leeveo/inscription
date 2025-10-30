import { BuilderProvider } from '@/contexts/BuilderContext';

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuilderProvider>
      <div className="h-screen w-screen overflow-hidden bg-gray-50">
        {children}
      </div>
    </BuilderProvider>
  );
}
