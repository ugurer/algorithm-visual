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
  generateRandomArray,
  swap 
} from "@/utils/algorithm";

type AlgorithmType = "bubble" | "quick" | "merge" | "insertion";

const algorithmOptions: AlgorithmOption[] = [
  { value: "bubble", label: "Bubble Sort" },
  { value: "quick", label: "Quick Sort" },
  { value: "merge", label: "Merge Sort" },
  { value: "insertion", label: "Insertion Sort" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "bubble":
      return `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Elemanları yer değiştir
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`;
    case "quick":
      return `function quickSort(arr, low, high) {
  if (low < high) {
    // Pivot elemanını bul
    let pi = partition(arr, low, high);

    // Pivot'un sol ve sağ tarafını sırala
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  let pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`;
    case "merge":
      return `function mergeSort(arr, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    
    // Sol ve sağ yarıyı sırala
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    
    // Sıralı yarıları birleştir
    merge(arr, left, mid, right);
  }
}

function merge(arr, left, mid, right) {
  const n1 = mid - left + 1;
  const n2 = right - mid;
  const L = arr.slice(left, mid + 1);
  const R = arr.slice(mid + 1, right + 1);
  
  let i = 0, j = 0, k = left;
  
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }
  
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }
  
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}`;
    case "insertion":
      return `function insertionSort(arr) {
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    // Elemanı doğru konuma yerleştir
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  
  return arr;
}`;
  }
};

export default function SortingPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("bubble");
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
    }))
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  const learningSteps: LearningStep[] = [
    {
      title: "Sıralama Algoritmaları",
      description: "Sıralama algoritmaları, veri kümelerini belirli bir düzene göre organize etmek için kullanılır.",
    },
    {
      title: "Bubble Sort",
      description: "Bubble Sort, komşu elemanları karşılaştırıp gerektiğinde yer değiştirerek sıralama yapar.",
      code: getAlgorithmCode("bubble"),
    },
    {
      title: "Quick Sort",
      description: "Quick Sort, 'böl ve yönet' stratejisini kullanarak hızlı sıralama yapar.",
      code: getAlgorithmCode("quick"),
    },
    {
      title: "Merge Sort",
      description: "Merge Sort, diziyi sürekli ikiye bölerek ve birleştirerek sıralama yapar.",
      code: getAlgorithmCode("merge"),
    },
    {
      title: "Insertion Sort",
      description: "Insertion Sort, diziyi sol taraftan başlayarak sıralı hale getirir.",
      code: getAlgorithmCode("insertion"),
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
    }));
    setArray(newArray);
  }, []);

  const bubbleSort = useCallback(async () => {
    const arr = [...array];
    const n = arr.length;
    let operations = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        await checkPause();
        operations++;

        arr[j].isSearching = true;
        arr[j + 1].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        if (arr[j].value > arr[j + 1].value) {
          swap(arr, j, j + 1);
          if (soundEnabled) playClick();
        }

        arr[j].isSearching = false;
        arr[j + 1].isSearching = false;
        arr[n - i - 1].isSorted = true;
        setArray([...arr]);
      }
    }

    arr[0].isSorted = true;
    setArray([...arr]);
    setStats(prev => updateStats(prev, { operations }));
  }, [array, speed, soundEnabled, checkPause]);

  const quickSort = useCallback(async () => {
    const arr = [...array];
    let operations = 0;

    const partition = async (low: number, high: number) => {
      const pivot = arr[high].value;
      let i = low - 1;

      arr[high].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      for (let j = low; j < high; j++) {
        await checkPause();
        operations++;

        arr[j].isSearching = true;
        if (i >= 0) arr[i].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        if (arr[j].value < pivot) {
          i++;
          swap(arr, i, j);
          if (soundEnabled) playClick();
        }

        arr[j].isSearching = false;
        if (i >= 0) arr[i].isSearching = false;
        setArray([...arr]);
      }

      swap(arr, i + 1, high);
      arr[high].isSearching = false;
      arr[i + 1].isSorted = true;
      setArray([...arr]);
      await sleep(speed);

      return i + 1;
    };

    const quickSortHelper = async (low: number, high: number) => {
      if (low < high) {
        const pi = await partition(low, high);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
      } else if (low === high) {
        arr[low].isSorted = true;
        setArray([...arr]);
      }
    };

    await quickSortHelper(0, arr.length - 1);
    setStats(prev => updateStats(prev, { operations }));
  }, [array, speed, soundEnabled, checkPause]);

  const mergeSort = useCallback(async () => {
    const arr = [...array];
    let operations = 0;

    const merge = async (left: number, mid: number, right: number) => {
      const n1 = mid - left + 1;
      const n2 = right - mid;
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);

      let i = 0, j = 0, k = left;

      while (i < n1 && j < n2) {
        await checkPause();
        operations++;

        arr[k].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        if (L[i].value <= R[j].value) {
          arr[k] = { ...L[i], isSearching: false, isSorted: true };
          i++;
        } else {
          arr[k] = { ...R[j], isSearching: false, isSorted: true };
          j++;
        }

        if (soundEnabled) playClick();
        k++;
        setArray([...arr]);
      }

      while (i < n1) {
        await checkPause();
        arr[k].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        arr[k] = { ...L[i], isSearching: false, isSorted: true };
        if (soundEnabled) playClick();
        i++;
        k++;
        setArray([...arr]);
      }

      while (j < n2) {
        await checkPause();
        arr[k].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        arr[k] = { ...R[j], isSearching: false, isSorted: true };
        if (soundEnabled) playClick();
        j++;
        k++;
        setArray([...arr]);
      }
    };

    const mergeSortHelper = async (left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await mergeSortHelper(left, mid);
        await mergeSortHelper(mid + 1, right);
        await merge(left, mid, right);
      }
    };

    await mergeSortHelper(0, arr.length - 1);
    setStats(prev => updateStats(prev, { operations }));
  }, [array, speed, soundEnabled, checkPause]);

  const insertionSort = useCallback(async () => {
    const arr = [...array];
    let operations = 0;

    arr[0].isSorted = true;
    setArray([...arr]);

    for (let i = 1; i < arr.length; i++) {
      const key = { ...arr[i] };
      let j = i - 1;

      await checkPause();
      arr[i].isSearching = true;
      setArray([...arr]);
      await sleep(speed);

      while (j >= 0 && arr[j].value > key.value) {
        await checkPause();
        operations++;

        arr[j].isSearching = true;
        setArray([...arr]);
        await sleep(speed);

        arr[j + 1] = { ...arr[j], isSearching: false };
        arr[j].isSearching = false;
        if (soundEnabled) playClick();

        j--;
        setArray([...arr]);
      }

      arr[j + 1] = { ...key, isSearching: false, isSorted: true };
      for (let k = 0; k <= j + 1; k++) {
        arr[k].isSorted = true;
      }
      setArray([...arr]);
      await sleep(speed);
    }

    setStats(prev => updateStats(prev, { operations }));
  }, [array, speed, soundEnabled, checkPause]);

  const runCode = useCallback(async () => {
    if (isRunning && !isPaused) return;

    try {
      const startTime = performance.now();
      setIsRunning(true);
      setIsPaused(false);
      pauseRef.current = false;

      switch (selectedAlgorithm) {
        case "bubble":
          await bubbleSort();
          break;
        case "quick":
          await quickSort();
          break;
        case "merge":
          await mergeSort();
          break;
        case "insertion":
          await insertionSort();
          break;
      }

      const endTime = performance.now();
      setStats(prev => updateStats(prev, {
        elapsedTime: endTime - startTime
      }));

      if (soundEnabled) {
        playSuccess();
      }
    } catch (error) {
      console.error("Algoritma çalıştırma hatası:", error);
      setShowToast(true);
    } finally {
      setIsRunning(false);
    }
  }, [selectedAlgorithm, bubbleSort, quickSort, mergeSort, insertionSort, isRunning, isPaused, soundEnabled]);

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
      name: "arrayLength",
      value: array.length,
      type: "number"
    }
  ];

  return (
    <PageContainer
      title="Sıralama Algoritmaları"
      description="Farklı sıralama algoritmalarını görselleştirin ve karşılaştırın."
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
          generateNewArray();
          setStats({
            operations: 0,
            elapsedTime: 0,
            memoryUsage: 0,
          });
        }}
        onGenerateRandom={generateNewArray}
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
        <div className="h-64 flex items-end justify-center gap-1">
          {array.map((item) => (
            <motion.div
              key={item.id}
              className={`w-8 ${
                item.isSearching
                  ? "bg-yellow-400"
                  : item.isSorted
                  ? "bg-green-500"
                  : "bg-blue-500"
              } transition-colors`}
              style={{ height: `${(item.value / 100) * 100}%` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            />
          ))}
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