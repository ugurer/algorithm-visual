import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface LearningCardProps {
  steps: Array<{
    title: string;
    description: string;
    code?: string;
  }>;
  onComplete?: () => void;
  className?: string;
}

export function LearningCard({ steps, onComplete, className }: LearningCardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border p-6 mb-6",
        className
      )}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-500">
            {steps[currentStep].title}
          </h3>
          <div className="text-sm text-gray-500">
            Adım {currentStep + 1} / {steps.length}
          </div>
        </div>

        <p className="text-gray-600">{steps[currentStep].description}</p>

        {steps[currentStep].code && (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-500 overflow-x-auto">
              {steps[currentStep].code}
            </pre>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleNextStep}
            variant="default"
          >
            {currentStep < steps.length - 1 ? "Sonraki Adım" : "Tamamla"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
} 