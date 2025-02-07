"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { ControlPanel } from "@/components/ui/control-panel";
import { AlgorithmCode } from "@/components/ui/algorithm-code";
import { ModeSelector } from "@/components/ui/mode-selector";
import { LearningCard } from "@/components/ui/learning-card";
import { ChallengeTimer } from "@/components/ui/challenge-timer";
import { DebugPanel } from "@/components/ui/debug-panel";
import { Bug } from "lucide-react";
import { playClick, playSuccess, initializeSounds } from "@/lib/sounds";
import { Toast } from "@/components/ui/toast";

type AlgorithmType = "recursion" | "iteration" | "math";
type AlgorithmMode = "learning" | "quick" | "challenge";

interface AlgorithmStats {
  operations: number;
  elapsedTime: number;
  memoryUsage: number;
}

const algorithmOptions = [
  { value: "recursion", label: "Özyineleme (Recursion)" },
  { value: "iteration", label: "Döngüler (Iteration)" },
  { value: "math", label: "Matematiksel İşlemler" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "recursion":
      return `// Özyineleme örneği: Faktöriyel hesaplama
function factorial(n: number): number {
  // Temel durum
  if (n <= 1) return 1;
  
  // Özyinelemeli çağrı
  return n * factorial(n - 1);
}`;
    case "iteration":
      return `// Döngü örneği: Dizi toplamı
function arraySum(arr: number[]): number {
  let sum = 0;
  
  // For döngüsü ile toplama
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  
  return sum;
}`;
    case "math":
      return `// Matematiksel işlem örneği: EBOB hesaplama
function gcd(a: number, b: number): number {
  // Öklid algoritması
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  return a;
}`;
  }
};

export default function BasicPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("recursion");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [mode, setMode] = useState<AlgorithmMode>("quick");
  const [showLearningCard, setShowLearningCard] = useState(true);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(300);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentCode, setCurrentCode] = useState(getAlgorithmCode(selectedAlgorithm));
  const [stats, setStats] = useState<AlgorithmStats>({
    operations: 0,
    elapsedTime: 0,
    memoryUsage: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  const learningSteps = [
    {
      title: "Temel Algoritma Kavramları",
      description: "Algoritma, belirli bir problemi çözmek için adım adım izlenen yol ve yöntemlerdir.",
    },
    {
      title: "Özyineleme (Recursion)",
      description: "Bir fonksiyonun kendisini çağırarak problemi daha küçük parçalara bölerek çözmesi.",
      code: getAlgorithmCode("recursion"),
    },
    {
      title: "Döngüler (Iteration)",
      description: "Belirli bir işlemi tekrar tekrar gerçekleştirmek için kullanılan yapılar.",
      code: getAlgorithmCode("iteration"),
    },
    {
      title: "Matematiksel İşlemler",
      description: "Temel matematiksel algoritmaların programlamada uygulanması.",
      code: getAlgorithmCode("math"),
    },
  ];

  useEffect(() => {
    initializeSounds();
  }, []);

  useEffect(() => {
    setCurrentCode(getAlgorithmCode(selectedAlgorithm));
  }, [selectedAlgorithm]);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkPause = async () => {
    while (pauseRef.current) {
      await sleep(100);
    }
  };

  const handleModeChange = (newMode: AlgorithmMode) => {
    setMode(newMode);
    if (newMode === "learning") {
      setShowLearningCard(true);
    } else {
      setShowLearningCard(false);
    }
  };

  const handleChallengeTimeUp = () => {
    if (mode === "challenge") {
      setIsRunning(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const runCode = useCallback(async () => {
    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const func = new AsyncFunction("updateStats", currentCode);
      await func((stats: AlgorithmStats) => setStats(stats));
    } catch (error) {
      console.error("Kod çalıştırma hatası:", error);
    }
  }, [currentCode]);

  return (
    <PageContainer
      title="Temel Algoritmalar"
      description="Temel algoritma kavramlarını ve programlama yapılarını öğrenin."
    >
      <ModeSelector
        selectedMode={mode}
        onModeChange={handleModeChange}
      />

      {mode === "learning" && showLearningCard && (
        <LearningCard
          steps={learningSteps}
          onComplete={() => setShowLearningCard(false)}
        />
      )}

      {mode === "challenge" && (
        <ChallengeTimer
          duration={challengeTimeLeft}
          onTimeUp={handleChallengeTimeUp}
          className="mb-4"
        />
      )}

      <ControlPanel
        algorithmOptions={algorithmOptions}
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmChange={(value) => setSelectedAlgorithm(value as AlgorithmType)}
        speed={speed}
        onSpeedChange={setSpeed}
        onStart={runCode}
        onReset={() => {
          setIsRunning(false);
          setIsPaused(false);
          pauseRef.current = false;
          setStats({
            operations: 0,
            elapsedTime: 0,
            memoryUsage: 0,
          });
        }}
        isRunning={isRunning}
        isPaused={isPaused}
        customControls={
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Ses Efektleri</span>
            </label>
            <button
              onClick={() => setIsDebugMode(!isDebugMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDebugMode
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Bug size={18} />
              <span>Debug Modu</span>
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-500">Algoritma Açıklaması</h3>
          <div className="prose max-w-none text-gray-800">
            {selectedAlgorithm === "recursion" && (
              <>
                <p>Özyineleme (Recursion), bir problemin çözümünü kendisinin daha küçük versiyonlarına bölerek çözen bir programlama tekniğidir.</p>
                <ul>
                  <li>Temel durum (base case) tanımlanmalıdır</li>
                  <li>Her çağrı problemi küçültmelidir</li>
                  <li>Sonunda temel duruma ulaşılmalıdır</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "iteration" && (
              <>
                <p>Döngüler (Iteration), belirli bir işlemi tekrar tekrar gerçekleştirmek için kullanılan yapılardır.</p>
                <ul>
                  <li>For döngüsü: Belirli sayıda tekrar</li>
                  <li>While döngüsü: Koşul sağlandığı sürece tekrar</li>
                  <li>Do-while döngüsü: En az bir kez çalışır</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "math" && (
              <>
                <p>Matematiksel algoritmalar, temel matematik işlemlerinin programlamada uygulanmasıdır.</p>
                <ul>
                  <li>EBOB (GCD) hesaplama</li>
                  <li>Asal sayı kontrolü</li>
                  <li>Fibonacci dizisi</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <AlgorithmCode
        title={algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.label || ""}
        code={getAlgorithmCode(selectedAlgorithm)}
      />

      {isDebugMode && (
        <DebugPanel
          code={currentCode}
          onCodeChange={setCurrentCode}
          onRun={runCode}
          onStop={() => {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
          }}
          isRunning={isRunning}
          variables={[
            {
              name: "operations",
              value: stats.operations,
              type: "number"
            },
            {
              name: "elapsedTime",
              value: stats.elapsedTime,
              type: "number"
            },
            {
              name: "memoryUsage",
              value: stats.memoryUsage,
              type: "number"
            }
          ]}
          className="mt-4"
        />
      )}

      <AnimatePresence>
        {showToast && (
          <Toast
            message="Süre doldu!"
            type="info"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
} 