import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";

interface ChallengeTimerProps {
  duration: number; // saniye cinsinden
  onTimeUp: () => void;
  className?: string;
}

export function ChallengeTimer({
  duration,
  onTimeUp,
  className,
}: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    // Son 10 saniyede uyarı modunu aktifleştir
    setIsWarning(timeLeft <= 10);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  // Zamanı formatla (mm:ss)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
        isWarning
          ? "bg-red-50 border-red-200 text-red-600"
          : "bg-blue-50 border-blue-200 text-blue-600",
        className
      )}
    >
      <Timer
        className={cn(
          "w-5 h-5",
          isWarning && "animate-pulse text-red-500"
        )}
      />
      <span className="font-mono text-lg font-medium">{formattedTime}</span>
    </div>
  );
} 