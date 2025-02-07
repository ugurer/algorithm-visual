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
import { 
  AlgorithmMode, 
  AlgorithmStats, 
  AlgorithmOption,
  LearningStep,
  DebugVariable
} from "@/types/algorithm";
import { 
  sleep, 
  measurePerformance, 
  updateStats 
} from "@/utils/algorithm";

type AlgorithmType = "fibonacci" | "knapsack" | "lcs" | "matrix-chain";

interface DPCell {
  value: number;
  isActive: boolean;
  isCalculated: boolean;
}

const algorithmOptions: AlgorithmOption[] = [
  { value: "fibonacci", label: "Fibonacci" },
  { value: "knapsack", label: "Knapsack" },
  { value: "lcs", label: "Longest Common Subsequence" },
  { value: "matrix-chain", label: "Matrix Chain Multiplication" },
];

const learningSteps: LearningStep[] = [
  {
    title: "Dinamik Programlama",
    description: "Dinamik programlama, karmaşık problemleri alt problemlere bölerek çözen bir algoritmik yaklaşımdır.",
  },
  {
    title: "Fibonacci",
    description: "Fibonacci sayılarını dinamik programlama ile hesaplayan algoritma.",
    code: "// Fibonacci kodu buraya gelecek",
  },
  {
    title: "Knapsack",
    description: "Sırt çantası problemi, belirli bir kapasiteye göre maksimum değeri hesaplar.",
    code: "// Knapsack kodu buraya gelecek",
  },
  {
    title: "LCS",
    description: "En uzun ortak altdizi problemi, iki dizinin ortak olan en uzun altdizisini bulmayı amaçlar.",
    code: "// LCS kodu buraya gelecek",
  },
  {
    title: "Matrix Chain",
    description: "Matris çarpımlarını en az maliyetle gerçekleştiren sıralamayı bulan algoritma.",
    code: "// Matrix Chain kodu buraya gelecek",
  },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "fibonacci":
      return `function fibonacci(n: number): number {
  const dp: number[] = new Array(n + 1).fill(0);
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}`;
    case "knapsack":
      return `function knapsack(values: number[], weights: number[], capacity: number): number {
  const n = values.length;
  const dp: number[][] = Array(n + 1)
    .fill(0)
    .map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          values[i - 1] + dp[i - 1][w - weights[i - 1]],
          dp[i - 1][w]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}`;
    case "lcs":
      return `function lcs(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(0)
    .map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  let result = "";
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      result = str1[i - 1] + result;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return result;
}`;
    case "matrix-chain":
      return `function matrixChain(dimensions: number[]): number {
  const n = dimensions.length - 1;
  const dp: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i < n - len + 1; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      
      for (let k = i; k < j; k++) {
        const cost =
          dp[i][k] +
          dp[k + 1][j] +
          dimensions[i] * dimensions[k + 1] * dimensions[j + 1];
        dp[i][j] = Math.min(dp[i][j], cost);
      }
    }
  }
  
  return dp[0][n - 1];
}`;
    default:
      return "";
  }
};

export default function DynamicPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("fibonacci");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [mode, setMode] = useState<AlgorithmMode>("quick");
  const [showLearningCard, setShowLearningCard] = useState(true);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(300);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentCode, setCurrentCode] = useState("");
  const [stats, setStats] = useState<AlgorithmStats>({
    operations: 0,
    elapsedTime: 0,
    memoryUsage: 0,
  });

  const [matrix, setMatrix] = useState<DPCell[][]>(
    Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({
        value: Math.floor(Math.random() * 10),
        isActive: false,
        isCalculated: false,
      }))
    )
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    initializeSounds();
  }, []);

  useEffect(() => {
    setCurrentCode(getAlgorithmCode(selectedAlgorithm));
  }, [selectedAlgorithm]);

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

  return (
    <PageContainer
      title="Dinamik Programlama"
      description="Dinamik programlama algoritmalarını görselleştirin ve karşılaştırın."
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
        isRunning={isRunning}
        isPaused={isPaused}
        onStart={() => {}}
        onReset={() => {
          setIsRunning(false);
          setIsPaused(false);
          pauseRef.current = false;
          setMatrix(matrix.map(row => row.map(cell => ({ 
            ...cell, 
            isActive: false, 
            isCalculated: false 
          }))));
          setStats({
            operations: 0,
            elapsedTime: 0,
            memoryUsage: 0,
          });
        }}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dinamik Programlama Matrisi */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            DP Matrisi
          </h3>
          
          <div className="grid gap-2" style={{ 
            gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` 
          }}>
            {matrix.map((row, i) =>
              row.map((cell, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  className={`aspect-square flex items-center justify-center rounded-lg border ${
                    cell.isActive
                      ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-400"
                      : cell.isCalculated
                      ? "bg-gradient-to-br from-emerald-50 to-teal-100 border-teal-400"
                      : "bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200"
                  } transition-colors`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-sm font-medium bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {cell.value}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Algoritma Açıklaması */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Algoritma Açıklaması
          </h3>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600">
              {selectedAlgorithm === "fibonacci" && (
                "Fibonacci dizisi, her sayının kendinden önceki iki sayının toplamı olduğu bir dizidir. Dinamik programlama ile hesaplanması çok daha verimlidir."
              )}
              {selectedAlgorithm === "knapsack" && (
                "Sırt çantası problemi, belirli bir ağırlık sınırı olan çantaya maksimum değerde eşya yerleştirme problemidir. Dinamik programlama optimal çözümü bulur."
              )}
              {selectedAlgorithm === "lcs" && (
                "En uzun ortak altdizi problemi, iki dizinin ortak olan en uzun altdizisini bulmayı amaçlar. Dinamik programlama ile verimli bir şekilde çözülür."
              )}
              {selectedAlgorithm === "matrix-chain" && (
                "Matris zinciri çarpımı problemi, bir dizi matrisin çarpımını minimum işlem sayısı ile gerçekleştirmeyi amaçlar."
              )}
            </p>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200">
            <h4 className="text-sm font-semibold bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Algoritma Detayları
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">İşlem Sayısı</p>
                <p className="text-sm font-medium bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {stats.operations}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Geçen Süre</p>
                <p className="text-sm font-medium bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {stats.elapsedTime}ms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDebugMode && (
        <DebugPanel
          code={currentCode}
          onCodeChange={setCurrentCode}
          onRun={() => {}}
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