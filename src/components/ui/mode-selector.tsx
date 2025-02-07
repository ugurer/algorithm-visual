import { Lightbulb, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlgorithmMode = "learning" | "quick" | "challenge";

interface ModeSelectorProps {
  selectedMode: AlgorithmMode;
  onModeChange: (mode: AlgorithmMode) => void;
  className?: string;
}

const modes = [
  {
    id: "learning",
    label: "Öğrenme Modu",
    description: "Algoritmaları adım adım öğrenin",
    icon: Lightbulb,
    color: "text-green-500",
  },
  {
    id: "quick",
    label: "Hızlı Test",
    description: "Sadece sonucu görün",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    id: "challenge",
    label: "Challenge",
    description: "Kendinizi test edin",
    icon: Trophy,
    color: "text-purple-500",
  },
];

export function ModeSelector({
  selectedMode,
  onModeChange,
  className,
}: ModeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selectedMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id as AlgorithmMode)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
              isSelected
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-200"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-white shadow-sm" : "bg-gray-50"
              )}
            >
              <Icon className={cn("w-6 h-6", mode.color)} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{mode.label}</div>
              <div className="text-sm text-gray-500">{mode.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
} 