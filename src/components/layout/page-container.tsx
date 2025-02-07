import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function PageContainer({ children, title, description }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-gray-600">{description}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
} 