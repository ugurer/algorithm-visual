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

type AlgorithmType = "bst" | "avl" | "traversal";
type AlgorithmMode = "learning" | "quick" | "challenge";

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height?: number;
  isVisited?: boolean;
  isProcessing?: boolean;
}

interface AlgorithmStats {
  operations: number;
  elapsedTime: number;
  memoryUsage: number;
}

const algorithmOptions = [
  { value: "bst", label: "Binary Search Tree" },
  { value: "avl", label: "AVL Tree" },
  { value: "traversal", label: "Ağaç Gezinme" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "bst":
      return `// Binary Search Tree örneği
class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insertBST(root: TreeNode | null, value: number): TreeNode {
  if (!root) return new TreeNode(value);
  
  if (value < root.value) {
    root.left = insertBST(root.left, value);
  } else {
    root.right = insertBST(root.right, value);
  }
  
  return root;
}`;
    case "avl":
      return `// AVL Tree örneği
class AVLNode {
  value: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;

  constructor(value: number) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

function getHeight(node: AVLNode | null): number {
  return node ? node.height : 0;
}

function getBalance(node: AVLNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

  return x;
}`;
    case "traversal":
      return `// Ağaç gezinme örneği
function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  
  function traverse(node: TreeNode | null) {
    if (!node) return;
    
    // Sol alt ağaç
    traverse(node.left);
    
    // Kök düğüm
    result.push(node.value);
    
    // Sağ alt ağaç
    traverse(node.right);
  }
  
  traverse(root);
  return result;
}`;
  }
};

export default function TreePage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("bst");
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
      title: "Ağaç Veri Yapısı",
      description: "Ağaçlar, hiyerarşik veri yapılarıdır ve düğümlerden oluşur. Her düğümün bir veya daha fazla alt düğümü olabilir.",
    },
    {
      title: "Binary Search Tree (BST)",
      description: "BST, her düğümün solundaki değerlerin küçük, sağındaki değerlerin büyük olduğu özel bir ağaç türüdür.",
      code: getAlgorithmCode("bst"),
    },
    {
      title: "AVL Tree",
      description: "AVL ağaçları, dengeli bir BST türüdür. Her düğümün sol ve sağ alt ağaçlarının yükseklikleri arasındaki fark en fazla 1'dir.",
      code: getAlgorithmCode("avl"),
    },
    {
      title: "Ağaç Gezinme",
      description: "Ağaç gezinme, ağaçtaki tüm düğümleri belirli bir sırayla ziyaret etme işlemidir. Inorder, Preorder ve Postorder gezinme türleri vardır.",
      code: getAlgorithmCode("traversal"),
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
      title="Ağaç Algoritmaları"
      description="Ağaç veri yapıları ve algoritmaları üzerinde çalışın ve görselleştirin."
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
            {selectedAlgorithm === "bst" && (
              <>
                <p>Binary Search Tree (BST), her düğümün en fazla iki alt düğüme sahip olduğu ve düğümlerin belirli bir düzene göre yerleştirildiği bir ağaç yapısıdır.</p>
                <ul>
                  <li>Sol alt ağaçtaki tüm değerler düğüm değerinden küçüktür</li>
                  <li>Sağ alt ağaçtaki tüm değerler düğüm değerinden büyüktür</li>
                  <li>Arama, ekleme ve silme işlemleri O(log n) karmaşıklığındadır</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "avl" && (
              <>
                <p>AVL ağaçları, kendini dengeleyen bir BST türüdür. Her düğümün sol ve sağ alt ağaçlarının yükseklikleri arasındaki fark en fazla 1'dir.</p>
                <ul>
                  <li>Otomatik dengeleme özelliği</li>
                  <li>Sağa ve sola döndürme işlemleri</li>
                  <li>Tüm işlemler O(log n) karmaşıklığındadır</li>
                </ul>
              </>
            )}
            {selectedAlgorithm === "traversal" && (
              <>
                <p>Ağaç gezinme, ağaçtaki tüm düğümleri belirli bir sırayla ziyaret etme işlemidir.</p>
                <ul>
                  <li>Inorder: Sol - Kök - Sağ</li>
                  <li>Preorder: Kök - Sol - Sağ</li>
                  <li>Postorder: Sol - Sağ - Kök</li>
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