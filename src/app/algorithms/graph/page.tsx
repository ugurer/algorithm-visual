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
  GraphNode
} from "@/types/algorithm";
import { 
  sleep, 
  measurePerformance, 
  updateStats,
  manhattanDistance,
  euclideanDistance
} from "@/utils/algorithm";

type AlgorithmType = "dfs" | "bfs" | "dijkstra" | "astar";

interface Edge {
  from: string;
  to: string;
  weight?: number;
}

const algorithmOptions: AlgorithmOption[] = [
  { value: "dfs", label: "Derinlik Öncelikli Arama (DFS)" },
  { value: "bfs", label: "Genişlik Öncelikli Arama (BFS)" },
  { value: "dijkstra", label: "Dijkstra Algoritması" },
  { value: "astar", label: "A* Pathfinding" },
];

const GRID_SIZE = 10;

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "dfs":
      return `function dfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function traverse(node: string) {
    visited.add(node);
    result.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        traverse(neighbor);
      }
    }
  }

  traverse(start);
  return result;
}`;
    case "bfs":
      return `function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const queue: string[] = [start];
  const result: string[] = [];

  visited.add(start);

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}`;
    case "dijkstra":
      return `function dijkstra(
  graph: Map<string, Map<string, number>>,
  start: string
): Map<string, number> {
  const distances = new Map<string, number>();
  const visited = new Set<string>();
  const queue = new PriorityQueue<string>();

  // Başlangıç mesafelerini ayarla
  for (const node of graph.keys()) {
    distances.set(node, node === start ? 0 : Infinity);
  }
  queue.enqueue(start, 0);

  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const neighbors = graph.get(current) || new Map();
    for (const [neighbor, weight] of neighbors) {
      if (visited.has(neighbor)) continue;

      const distance = distances.get(current)! + weight;
      if (distance < distances.get(neighbor)!) {
        distances.set(neighbor, distance);
        queue.enqueue(neighbor, distance);
      }
    }
  }

  return distances;
}`;
    case "astar":
      return `function astar(
  graph: Map<string, Map<string, number>>,
  start: string,
  goal: string,
  heuristic: (node: string) => number
): string[] {
  const openSet = new PriorityQueue<string>();
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  // Başlangıç değerlerini ayarla
  gScore.set(start, 0);
  fScore.set(start, heuristic(start));
  openSet.enqueue(start, fScore.get(start)!);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue()!;
    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    closedSet.add(current);
    const neighbors = graph.get(current) || new Map();

    for (const [neighbor, weight] of neighbors) {
      if (closedSet.has(neighbor)) continue;

      const tentativeGScore = (gScore.get(current) || Infinity) + weight;

      if (!openSet.contains(neighbor)) {
        openSet.enqueue(neighbor, fScore.get(neighbor)!);
      } else if (tentativeGScore >= (gScore.get(neighbor) || Infinity)) {
        continue;
      }

      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(neighbor, gScore.get(neighbor)! + heuristic(neighbor));
    }
  }

  return []; // Yol bulunamadı
}

function reconstructPath(
  cameFrom: Map<string, string>,
  current: string
): string[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(current);
  }
  return path;
}`;
    default:
      return "";
  }
};

export default function GraphPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("dfs");
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

  const [graph, setGraph] = useState<Map<string, Map<string, number>>>(new Map());
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<Array<{ from: string; to: string; weight: number }>>([]);
  const [startNode, setStartNode] = useState<string | null>(null);
  const [endNode, setEndNode] = useState<string | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  const learningSteps: LearningStep[] = [
    {
      title: "Graf Algoritmaları",
      description: "Graf algoritmaları, düğümler ve kenarlardan oluşan veri yapıları üzerinde çalışan algoritmalardır.",
    },
    {
      title: "Derinlik Öncelikli Arama (DFS)",
      description: "DFS, bir grafı mümkün olduğunca derine inerek araştıran bir algoritmadır.",
      code: getAlgorithmCode("dfs"),
    },
    {
      title: "Genişlik Öncelikli Arama (BFS)",
      description: "BFS, bir grafı seviye seviye araştıran bir algoritmadır.",
      code: getAlgorithmCode("bfs"),
    },
    {
      title: "Dijkstra En Kısa Yol",
      description: "Dijkstra algoritması, ağırlıklı bir grafta en kısa yolu bulan bir algoritmadır.",
      code: getAlgorithmCode("dijkstra"),
    },
    {
      title: "A* Yol Bulma",
      description: "A* algoritması, hedefe yönelik sezgisel bir yol bulma algoritmasıdır.",
      code: getAlgorithmCode("astar"),
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

  const dfs = useCallback(async () => {
    if (!startNode) return;
    let operations = 0;
    const visited = new Set<string>();
    const result: string[] = [];

    const traverse = async (node: string) => {
      await checkPause();
      operations++;

      visited.add(node);
      result.push(node);
      setVisitedNodes(new Set(visited));
      setCurrentNode(node);
      if (soundEnabled) playClick();

      await sleep(speed);

      const neighbors = Array.from(graph.get(node)?.keys() || []);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          await traverse(neighbor);
        }
      }
    };

    await traverse(startNode);
    setPath(result);
    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  }, [startNode, graph, speed, soundEnabled, checkPause]);

  const bfs = useCallback(async () => {
    if (!startNode) return;
    let operations = 0;
    const visited = new Set<string>();
    const queue: string[] = [startNode];
    const result: string[] = [];

    visited.add(startNode);
    setVisitedNodes(new Set(visited));

    while (queue.length > 0) {
      await checkPause();
      operations++;

      const node = queue.shift()!;
      result.push(node);
      setCurrentNode(node);
      if (soundEnabled) playClick();

      await sleep(speed);

      const neighbors = Array.from(graph.get(node)?.keys() || []);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          setVisitedNodes(new Set(visited));
        }
      }
    }

    setPath(result);
    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  }, [startNode, graph, speed, soundEnabled, checkPause]);

  const dijkstra = useCallback(async () => {
    if (!startNode) return;
    let operations = 0;
    const distances = new Map<string, number>();
    const visited = new Set<string>();
    const previous = new Map<string, string>();

    // Başlangıç mesafelerini ayarla
    for (const node of graph.keys()) {
      distances.set(node, node === startNode ? 0 : Infinity);
    }

    while (true) {
      await checkPause();
      operations++;

      // En küçük mesafeli düğümü bul
      let minDistance = Infinity;
      let current: string | null = null;
      for (const [node, distance] of distances) {
        if (!visited.has(node) && distance < minDistance) {
          minDistance = distance;
          current = node;
        }
      }

      if (!current || minDistance === Infinity) break;

      visited.add(current);
      setVisitedNodes(new Set(visited));
      setCurrentNode(current);
      if (soundEnabled) playClick();

      await sleep(speed);

      const neighbors = graph.get(current);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors) {
        if (visited.has(neighbor)) continue;

        const distance = distances.get(current)! + weight;
        if (distance < distances.get(neighbor)!) {
          distances.set(neighbor, distance);
          previous.set(neighbor, current);
        }
      }
    }

    // En kısa yolu oluştur
    if (endNode && previous.has(endNode)) {
      const path: string[] = [];
      let current = endNode;
      while (current) {
        path.unshift(current);
        current = previous.get(current)!;
      }
      setPath(path);
    }

    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  }, [startNode, endNode, graph, speed, soundEnabled, checkPause]);

  const astar = useCallback(async () => {
    if (!startNode || !endNode) return;
    let operations = 0;
    const openSet = new Set<string>([startNode]);
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const cameFrom = new Map<string, string>();

    // Başlangıç değerlerini ayarla
    gScore.set(startNode, 0);
    fScore.set(startNode, manhattanDistance(nodes.find(n => n.id === startNode)!, nodes.find(n => n.id === endNode)!));

    while (openSet.size > 0) {
      await checkPause();
      operations++;

      // En düşük f değerine sahip düğümü bul
      let current = Array.from(openSet).reduce((a, b) => 
        (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
      );

      if (current === endNode) {
        // Yolu oluştur
        const path: string[] = [];
        while (current) {
          path.unshift(current);
          current = cameFrom.get(current)!;
        }
        setPath(path);
        break;
      }

      openSet.delete(current);
      closedSet.add(current);
      setVisitedNodes(closedSet);
      setCurrentNode(current);
      if (soundEnabled) playClick();

      await sleep(speed);

      const neighbors = graph.get(current);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors) {
        if (closedSet.has(neighbor)) continue;

        const tentativeGScore = (gScore.get(current) || Infinity) + weight;

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        } else if (tentativeGScore >= (gScore.get(neighbor) || Infinity)) {
          continue;
        }

        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, gScore.get(neighbor)! + manhattanDistance(
          nodes.find(n => n.id === neighbor)!,
          nodes.find(n => n.id === endNode)!
        ));
      }
    }

    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  }, [startNode, endNode, nodes, graph, speed, soundEnabled, checkPause]);

  const runCode = useCallback(async () => {
    if (isRunning && !isPaused) return;

    try {
      const startTime = performance.now();
      setIsRunning(true);
      setIsPaused(false);
      pauseRef.current = false;

      setVisitedNodes(new Set());
      setCurrentNode(null);
      setPath([]);

      switch (selectedAlgorithm) {
        case "dfs":
          await dfs();
          break;
        case "bfs":
          await bfs();
          break;
        case "dijkstra":
          await dijkstra();
          break;
        case "astar":
          await astar();
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
  }, [selectedAlgorithm, dfs, bfs, dijkstra, astar, isRunning, isPaused]);

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
      name: "visitedNodes",
      value: Array.from(visitedNodes),
      type: "object"
    },
    {
      name: "path",
      value: path,
      type: "object"
    }
  ];

  return (
    <PageContainer
      title="Graf Algoritmaları"
      description="Graf algoritmalarını görselleştirin ve karşılaştırın."
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
          setVisitedNodes(new Set());
          setCurrentNode(null);
          setPath([]);
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
            <button
              onClick={() => {
                const id = `node-${nodes.length + 1}`;
                setNodes(prev => [...prev, {
                  id,
                  x: Math.random() * 800,
                  y: Math.random() * 600,
                  isVisited: false,
                  isProcessing: false,
                  isWall: false,
                  isPath: false,
                  isStart: false,
                  isTarget: false,
                  value: 0
                }]);
                setGraph(prev => {
                  const newGraph = new Map(prev);
                  newGraph.set(id, new Map());
                  return newGraph;
                });
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Düğüm Ekle
            </button>

            <button
              onClick={() => {
                if (nodes.length < 2) return;
                const fromNode = nodes[Math.floor(Math.random() * nodes.length)];
                let toNode;
                do {
                  toNode = nodes[Math.floor(Math.random() * nodes.length)];
                } while (toNode.id === fromNode.id);

                const weight = Math.floor(Math.random() * 10) + 1;
                setEdges(prev => [...prev, { from: fromNode.id, to: toNode.id, weight }]);
                setGraph(prev => {
                  const newGraph = new Map(prev);
                  const fromEdges = newGraph.get(fromNode.id) || new Map();
                  fromEdges.set(toNode.id, weight);
                  newGraph.set(fromNode.id, fromEdges);

                  const toEdges = newGraph.get(toNode.id) || new Map();
                  toEdges.set(fromNode.id, weight);
                  newGraph.set(toNode.id, toEdges);

                  return newGraph;
                });
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={nodes.length < 2}
            >
              Kenar Ekle
            </button>

            <button
              onClick={() => {
                if (!startNode && nodes.length > 0) {
                  setStartNode(nodes[0].id);
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                startNode
                  ? "bg-gray-200 text-gray-700"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              disabled={startNode !== null || nodes.length === 0}
            >
              Başlangıç Düğümü Seç
            </button>

            <button
              onClick={() => {
                if (!endNode && nodes.length > 0) {
                  setEndNode(nodes[nodes.length - 1].id);
                }
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                endNode
                  ? "bg-gray-200 text-gray-700"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              disabled={endNode !== null || nodes.length === 0}
            >
              Hedef Düğümü Seç
            </button>

            <button
              onClick={() => {
                setNodes([]);
                setEdges([]);
                setGraph(new Map());
                setStartNode(null);
                setEndNode(null);
                setVisitedNodes(new Set());
                setCurrentNode(null);
                setPath([]);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Grafı Temizle
            </button>

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
        <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden">
          {/* Kenarlar */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map(({ from, to, weight }, index) => {
              const fromNode = nodes.find(n => n.id === from);
              const toNode = nodes.find(n => n.id === to);
              if (!fromNode || !toNode) return null;

              const isPath = path.includes(from) && path.includes(to) &&
                Math.abs(path.indexOf(from) - path.indexOf(to)) === 1;

              return (
                <g key={`edge-${index}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isPath ? "#22c55e" : "#94a3b8"}
                    strokeWidth={isPath ? 3 : 2}
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2}
                    fill="#64748b"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm"
                  >
                    {weight}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Düğümler */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                node.id === startNode
                  ? "bg-yellow-500 text-white"
                  : node.id === endNode
                  ? "bg-red-500 text-white"
                  : node.id === currentNode
                  ? "bg-blue-500 text-white"
                  : visitedNodes.has(node.id)
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-700"
              }`}
              style={{
                left: node.x,
                top: node.y,
              }}
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newNodes = nodes.map(n =>
                  n.id === node.id
                    ? { ...n, x: info.point.x, y: info.point.y }
                    : n
                );
                setNodes(newNodes);
              }}
            >
              {node.id.replace("node-", "")}
            </motion.div>
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