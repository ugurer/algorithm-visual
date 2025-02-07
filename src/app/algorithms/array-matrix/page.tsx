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
import { sleep, updateStats } from "@/utils/algorithm";

type AlgorithmType = "array" | "matrix" | "rotation";

interface ArrayOperation {
  type: "insert" | "delete" | "update";
  index: number;
  value?: number;
}

interface MatrixOperation {
  type: "rotate" | "transpose" | "multiply";
  row?: number;
  col?: number;
  value?: number;
}

const algorithmOptions = [
  { value: "array", label: "Dizi İşlemleri" },
  { value: "matrix", label: "Matris İşlemleri" },
  { value: "rotation", label: "Matris Döndürme" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "array":
      return `// Dizi işlemleri örneği
function arrayOperations(arr: number[]) {
  // Eleman ekleme
  arr.push(5);
  
  // Eleman silme
  arr.splice(2, 1);
  
  // Eleman güncelleme
  arr[0] = 10;
  
  return arr;
}`;
    case "matrix":
      return `// Matris işlemleri örneği
function matrixOperations(matrix: number[][]) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Matris transpozunu alma
  const transpose = Array(cols).fill(0)
    .map(() => Array(rows).fill(0));
    
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transpose[j][i] = matrix[i][j];
    }
  }
  
  return transpose;
}`;
    case "rotation":
      return `// Matris döndürme örneği (90 derece saat yönünde)
function rotateMatrix(matrix: number[][]) {
  const n = matrix.length;
  
  // Önce transpozu al
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = 
        [matrix[j][i], matrix[i][j]];
    }
  }
  
  // Sonra her satırı ters çevir
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
  
  return matrix;
}`;
  }
};

export default function ArrayMatrixPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("array");
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
      title: "Dizi ve Matris Kavramları",
      description: "Diziler ve matrisler, verileri düzenli bir şekilde depolamak için kullanılan veri yapılarıdır.",
    },
    {
      title: "Dizi İşlemleri",
      description: "Dizilerde eleman ekleme, silme ve güncelleme işlemleri.",
      code: getAlgorithmCode("array"),
    },
    {
      title: "Matris İşlemleri",
      description: "Matrislerde temel işlemler ve matris dönüşümleri.",
      code: getAlgorithmCode("matrix"),
    },
    {
      title: "Matris Döndürme",
      description: "Matrisi belirli bir açıyla döndürme işlemleri.",
      code: getAlgorithmCode("rotation"),
    },
  ];

  const [array, setArray] = useState<number[]>(() => 
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
  );

  const [matrix, setMatrix] = useState<number[][]>(() => 
    Array.from({ length: 5 }, () => 
      Array.from({ length: 5 }, () => Math.floor(Math.random() * 100))
    )
  );

  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<[number, number] | null>(null);

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

  const handleArrayOperation = async (type: "insert" | "delete" | "update") => {
    if (isRunning) return;
    setIsRunning(true);

    try {
      const newArray = [...array];
      let operations = 0;

      switch (type) {
        case "insert":
          const value = Math.floor(Math.random() * 100);
          const index = Math.floor(Math.random() * (array.length + 1));
          
          // Animasyon için indeksi işaretle
          setActiveIndices([index]);
          await sleep(speed);
          
          newArray.splice(index, 0, value);
          operations++;
          break;

        case "delete":
          if (array.length > 0) {
            const index = Math.floor(Math.random() * array.length);
            
            // Animasyon için indeksi işaretle
            setActiveIndices([index]);
            await sleep(speed);
            
            newArray.splice(index, 1);
            operations++;
          }
          break;

        case "update":
          if (array.length > 0) {
            const index = Math.floor(Math.random() * array.length);
            const value = Math.floor(Math.random() * 100);
            
            // Animasyon için indeksi işaretle
            setActiveIndices([index]);
            await sleep(speed);
            
            newArray[index] = value;
            operations++;
          }
          break;
      }

      setArray(newArray);
      setStats(prev => updateStats(prev, { operations }));
      if (soundEnabled) playSuccess();
    } finally {
      setIsRunning(false);
      setActiveIndices([]);
    }
  };

  const handleMatrixOperation = async (type: "rotate" | "transpose" | "multiply") => {
    if (isRunning) return;
    setIsRunning(true);

    try {
      let newMatrix = matrix.map(row => [...row]);
      let operations = 0;

      switch (type) {
        case "rotate":
          // 90 derece saat yönünde döndürme
          const n = matrix.length;
          
          // Önce transpozu al
          for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
              setActiveCell([i, j]);
              await sleep(speed / 2);
              
              [newMatrix[i][j], newMatrix[j][i]] = [newMatrix[j][i], newMatrix[i][j]];
              operations++;
            }
          }

          // Sonra her satırı ters çevir
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n / 2; j++) {
              setActiveCell([i, j]);
              await sleep(speed / 2);
              
              [newMatrix[i][j], newMatrix[i][n - 1 - j]] = [newMatrix[i][n - 1 - j], newMatrix[i][j]];
              operations++;
            }
          }
          break;

        case "transpose":
          for (let i = 0; i < matrix.length; i++) {
            for (let j = i; j < matrix[0].length; j++) {
              setActiveCell([i, j]);
              await sleep(speed / 2);
              
              [newMatrix[i][j], newMatrix[j][i]] = [newMatrix[j][i], newMatrix[i][j]];
              operations++;
            }
          }
          break;

        case "multiply":
          // Matrisin kendisiyle çarpımı
          const result = Array(matrix.length).fill(0)
            .map(() => Array(matrix.length).fill(0));

          for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
              setActiveCell([i, j]);
              await sleep(speed / 2);
              
              for (let k = 0; k < matrix.length; k++) {
                result[i][j] += matrix[i][k] * matrix[k][j];
                operations++;
              }
            }
          }
          newMatrix = result;
          break;
      }

      setMatrix(newMatrix);
      setStats(prev => updateStats(prev, { operations }));
      if (soundEnabled) playSuccess();
    } finally {
      setIsRunning(false);
      setActiveCell(null);
    }
  };

  return (
    <PageContainer
      title="Dizi ve Matris İşlemleri"
      description="Dizi ve matris algoritmaları üzerinde çalışın ve görselleştirin."
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
            {selectedAlgorithm === "array" && (
              <>
                <p>Dizi işlemleri, tek boyutlu veri yapıları üzerinde gerçekleştirilen temel operasyonlardır.</p>
                <ul>
                  <li>Eleman ekleme (push, unshift)</li>
                  <li>Eleman silme (pop, shift, splice)</li>
                  <li>Eleman güncelleme (indeks ile erişim)</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "matrix" && (
              <>
                <p>Matris işlemleri, iki boyutlu veri yapıları üzerinde gerçekleştirilen matematiksel operasyonlardır.</p>
                <ul>
                  <li>Matris toplama ve çıkarma</li>
                  <li>Matris çarpımı</li>
                  <li>Matris transpozu</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "rotation" && (
              <>
                <p>Matris döndürme, bir matrisi belirli bir açıyla döndürme işlemidir.</p>
                <ul>
                  <li>90 derece saat yönünde döndürme</li>
                  <li>90 derece saat yönünün tersine döndürme</li>
                  <li>180 derece döndürme</li>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dizi İşlemleri */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Dizi İşlemleri</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleArrayOperation("insert")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Ekle
            </button>
            <button
              onClick={() => handleArrayOperation("delete")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Sil
            </button>
            <button
              onClick={() => handleArrayOperation("update")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Güncelle
            </button>
          </div>

          <div className="flex items-end gap-1 h-48">
            {array.map((value, index) => (
              <motion.div
                key={index}
                className={`w-8 ${
                  activeIndices.includes(index)
                    ? "bg-gradient-to-t from-amber-400 to-yellow-400"
                    : "bg-gradient-to-t from-blue-600 to-indigo-500"
                } rounded-t-lg transition-colors`}
                style={{ height: `${value}%` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-xs text-center text-white mt-1 font-medium">
                  {value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Matris İşlemleri */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">Matris İşlemleri</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleMatrixOperation("rotate")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Döndür
            </button>
            <button
              onClick={() => handleMatrixOperation("transpose")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Transpoz
            </button>
            <button
              onClick={() => handleMatrixOperation("multiply")}
              disabled={isRunning}
              className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              Çarp
            </button>
          </div>

          <div className="grid gap-2" style={{ 
            gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` 
          }}>
            {matrix.map((row, i) =>
              row.map((value, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  className={`aspect-square flex items-center justify-center rounded-lg border ${
                    activeCell?.[0] === i && activeCell?.[1] === j
                      ? "bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-400"
                      : "bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200"
                  } transition-colors`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="text-sm font-medium bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {value}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 