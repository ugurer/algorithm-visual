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
  DebugVariable,
  ArrayItem
} from "@/types/algorithm";
import { 
  sleep, 
  measurePerformance, 
  updateStats, 
  generateRandomArray 
} from "@/utils/algorithm";

type AlgorithmType = "linear" | "binary" | "jump" | "interpolation";

const algorithmOptions: AlgorithmOption[] = [
  { value: "linear", label: "Linear Search" },
  { value: "binary", label: "Binary Search" },
  { value: "jump", label: "Jump Search" },
  { value: "interpolation", label: "Interpolation Search" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "linear":
      return `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`;
    case "binary":
      return `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`;
    case "jump":
      return `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  const step = Math.floor(Math.sqrt(n));
  let prev = 0;

  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }

  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }

  if (arr[prev] === target) return prev;
  return -1;
}`;
    case "interpolation":
      return `function interpolationSearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      if (arr[low] === target) return low;
      return -1;
    }

    const pos = low + Math.floor(
      ((high - low) * (target - arr[low])) / (arr[high] - arr[low])
    );

    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`;
    default:
      return "";
  }
};

export default function SearchPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("linear");
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

  const [array, setArray] = useState<ArrayItem[]>(() => 
    generateRandomArray(20).map((value, id) => ({
      id,
      value,
      isSearching: false,
      isFound: false,
      isSorted: false,
      isComparing: false,
      isSwapping: false
    })).sort((a, b) => a.value - b.value)
  );

  const [targetValue, setTargetValue] = useState<number>(
    array[Math.floor(Math.random() * array.length)].value
  );

  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [foundIndex, setFoundIndex] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  const learningSteps: LearningStep[] = [
    {
      title: "Arama Algoritmaları",
      description: "Arama algoritmaları, veri yapıları içinde belirli bir elemanı bulmak için kullanılır.",
    },
    {
      title: "Linear Search",
      description: "Linear Search, diziyi baştan sona tarayarak hedef elemanı arar.",
      code: getAlgorithmCode("linear"),
    },
    {
      title: "Binary Search",
      description: "Binary Search, sıralı dizide ortadan bölme yöntemiyle arama yapar.",
      code: getAlgorithmCode("binary"),
    },
    {
      title: "Jump Search",
      description: "Jump Search, sıralı dizide belirli adımlarla atlayarak arama yapar.",
      code: getAlgorithmCode("jump"),
    },
    {
      title: "Interpolation Search",
      description: "Interpolation Search, elemanların dağılımına göre tahminle arama yapar.",
      code: getAlgorithmCode("interpolation"),
    },
  ];

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

  const generateNewArray = useCallback(() => {
    const newArray = generateRandomArray(20).map((value, id) => ({
      id,
      value,
      isSearching: false,
      isFound: false,
      isSorted: false,
      isComparing: false,
      isSwapping: false
    })).sort((a, b) => a.value - b.value);
    setArray(newArray);
    setTargetValue(newArray[Math.floor(Math.random() * newArray.length)].value);
    setFoundIndex(null);
    setActiveIndices([]);
  }, []);

  const linearSearch = useCallback(async () => {
    const arr = [...array];
    let operations = 0;

    for (let i = 0; i < arr.length; i++) {
      await checkPause();
      operations++;

      arr[i].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      if (arr[i].value === targetValue) {
        arr[i].isFound = true;
        if (soundEnabled) playSuccess();
        setArray([...arr]);
        setFoundIndex(i);
        break;
      }

      arr[i].isSearching = false;
      setArray([...arr]);
      if (soundEnabled) playClick();
    }

    setStats(prev => updateStats(prev, { operations }));
  }, [array, targetValue, speed, soundEnabled, checkPause]);

  const binarySearch = useCallback(async () => {
    const arr = [...array];
    let operations = 0;
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      await checkPause();
      operations++;

      const mid = Math.floor((left + right) / 2);
      arr[mid].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      if (arr[mid].value === targetValue) {
        arr[mid].isFound = true;
        if (soundEnabled) playSuccess();
        setArray([...arr]);
        setFoundIndex(mid);
        break;
      }

      arr[mid].isSearching = false;
      if (soundEnabled) playClick();

      if (arr[mid].value < targetValue) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
      setArray([...arr]);
    }

    setStats(prev => updateStats(prev, { operations }));
  }, [array, targetValue, speed, soundEnabled, checkPause]);

  const jumpSearch = useCallback(async () => {
    const arr = [...array];
    let operations = 0;
    const n = arr.length;
    let step = Math.floor(Math.sqrt(n));
    let prev = 0;

    while (arr[Math.min(step, n) - 1].value < targetValue) {
      await checkPause();
      operations++;

      for (let i = prev; i < Math.min(step, n); i++) {
        arr[i].isSearching = true;
      }
      setArray([...arr]);
      await sleep(speed);

      for (let i = prev; i < Math.min(step, n); i++) {
        arr[i].isSearching = false;
      }
      if (soundEnabled) playClick();

      prev = step;
      if (prev >= n) break;
      step += Math.floor(Math.sqrt(n));
    }

    while (prev < Math.min(step, n) && arr[prev].value < targetValue) {
      await checkPause();
      operations++;

      arr[prev].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      arr[prev].isSearching = false;
      if (soundEnabled) playClick();
      prev++;
    }

    if (prev < n && arr[prev].value === targetValue) {
      arr[prev].isFound = true;
      if (soundEnabled) playSuccess();
      setArray([...arr]);
      setFoundIndex(prev);
    }

    setStats(prev => updateStats(prev, { operations }));
  }, [array, targetValue, speed, soundEnabled, checkPause]);

  const interpolationSearch = useCallback(async () => {
    const arr = [...array];
    let operations = 0;
    let low = 0;
    let high = arr.length - 1;

    while (low <= high && targetValue >= arr[low].value && targetValue <= arr[high].value) {
      await checkPause();
      operations++;

      if (low === high) {
        if (arr[low].value === targetValue) {
          arr[low].isFound = true;
          if (soundEnabled) playSuccess();
          setArray([...arr]);
          setFoundIndex(low);
        }
        break;
      }

      const pos = low + Math.floor(
        ((high - low) * (targetValue - arr[low].value)) /
        (arr[high].value - arr[low].value)
      );

      arr[pos].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      if (arr[pos].value === targetValue) {
        arr[pos].isFound = true;
        if (soundEnabled) playSuccess();
        setArray([...arr]);
        setFoundIndex(pos);
        break;
      }

      arr[pos].isSearching = false;
      if (soundEnabled) playClick();

      if (arr[pos].value < targetValue) {
        low = pos + 1;
      } else {
        high = pos - 1;
      }
      setArray([...arr]);
    }

    setStats(prev => updateStats(prev, { operations }));
  }, [array, targetValue, speed, soundEnabled, checkPause]);

  const runCode = useCallback(async () => {
    if (isRunning && !isPaused) return;

    try {
      const startTime = performance.now();
      setIsRunning(true);
      setIsPaused(false);
      pauseRef.current = false;

      switch (selectedAlgorithm) {
        case "linear":
          await linearSearch();
          break;
        case "binary":
          await binarySearch();
          break;
        case "jump":
          await jumpSearch();
          break;
        case "interpolation":
          await interpolationSearch();
          break;
      }

      const endTime = performance.now();
      setStats(prev => updateStats(prev, {
        elapsedTime: endTime - startTime
      }));

    } catch (error) {
      console.error("Algoritma çalıştırma hatası:", error);
      setShowToast(true);
    } finally {
      setIsRunning(false);
    }
  }, [selectedAlgorithm, linearSearch, binarySearch, jumpSearch, interpolationSearch, isRunning, isPaused]);

  const debugVariables: DebugVariable[] = [
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
    },
    {
      name: "targetValue",
      value: targetValue,
      type: "number"
    },
    {
      name: "arrayLength",
      value: array.length,
      type: "number"
    },
    {
      name: "activeIndices",
      value: activeIndices,
      type: "number[]"
    },
    {
      name: "foundIndex",
      value: foundIndex,
      type: "number | null"
    }
  ];

  return (
    <PageContainer
      title="Arama Algoritmaları"
      description="Farklı arama algoritmalarını görselleştirin ve karşılaştırın."
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
        onReset={generateNewArray}
        isRunning={isRunning}
        isPaused={isPaused}
        customControls={
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Hedef Değer:</span>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
                min={0}
                max={100}
              />
            </div>
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
        {/* Arama Algoritmaları */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Arama Algoritmaları
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setSelectedAlgorithm("linear");
                runCode();
              }}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Doğrusal Arama
            </button>
            <button
              onClick={() => {
                setSelectedAlgorithm("binary");
                runCode();
              }}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              İkili Arama
            </button>
            <button
              onClick={() => {
                setSelectedAlgorithm("jump");
                runCode();
              }}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Atlama Araması
            </button>
          </div>

          <div className="flex items-end gap-1 h-48">
            {array.map((item, index) => (
              <motion.div
                key={index}
                className={`w-8 ${
                  item.isSearching
                    ? "bg-gradient-to-t from-amber-400 to-yellow-400"
                    : item.isFound
                    ? "bg-gradient-to-t from-green-400 to-emerald-400"
                    : "bg-gradient-to-t from-blue-600 to-indigo-500"
                } rounded-t-lg transition-colors`}
                style={{ height: `${(item.value / Math.max(...array.map(a => a.value))) * 100}%` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-xs text-center text-white mt-1 font-medium">
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Algoritma Açıklaması */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Algoritma Açıklaması
          </h3>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-gray-600">
              {selectedAlgorithm === "linear" && (
                "Doğrusal arama, bir dizideki her elemanı sırayla kontrol ederek aranan değeri bulur. En basit arama algoritmasıdır."
              )}
              {selectedAlgorithm === "binary" && (
                "İkili arama, sıralı bir dizide ortadaki elemanı kontrol ederek ve arama aralığını yarıya bölerek çalışır. Çok hızlı bir algoritmadır."
              )}
              {selectedAlgorithm === "jump" && (
                "Atlama araması, sıralı bir dizide belirli adımlarla atlayarak ve sonra doğrusal arama yaparak çalışır. Doğrusal ve ikili arama arasında bir performans sunar."
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
          variables={debugVariables}
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