import { ArrowRight } from "lucide-react";

interface AlgorithmCodeProps {
  title: string;
  code: string;
}

export function AlgorithmCode({ title, code }: AlgorithmCodeProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-500">{title}</h2>
        <ArrowRight className="text-gray-400" size={20} />
        <div className="text-sm text-gray-500">Algoritma Kodu</div>
      </div>
      <pre className="bg-gray-900 text-gray-500 p-6 rounded-lg overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
} 