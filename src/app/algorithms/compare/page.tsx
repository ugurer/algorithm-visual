"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { ControlPanel } from "@/components/ui/control-panel";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { playClick, playSuccess, initializeSounds } from "@/lib/sounds";
import { Toast } from "@/components/ui/toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AlgorithmResult {
  name: string;
  comparisons: number;
  swaps: number;
  elapsedTime: number;
  memoryUsage: number;
}

interface ComparisonResult {
  inputSize: number;
  results: AlgorithmResult[];
}

const algorithmOptions = [
  { value: "bubble", label: "Bubble Sort" },
  { value: "quick", label: "Quick Sort" },
  { value: "merge", label: "Merge Sort" },
  { value: "insertion", label: "Insertion Sort" },
  { value: "linear", label: "Linear Search" },
  { value: "binary", label: "Binary Search" },
  { value: "jump", label: "Jump Search" },
  { value: "dfs", label: "DFS" },
  { value: "bfs", label: "BFS" },
  { value: "dijkstra", label: "Dijkstra" },
];

const inputSizes = [10, 50, 100, 500, 1000];

export default function ComparePage() {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    initializeSounds();
  }, []);

  const runComparison = useCallback(async () => {
    if (selectedAlgorithms.length < 2) {
      alert("Lütfen en az 2 algoritma seçin!");
      return;
    }

    setIsRunning(true);
    const newResults: ComparisonResult[] = [];

    for (const size of inputSizes) {
      const algorithmResults: AlgorithmResult[] = [];

      for (const algo of selectedAlgorithms) {
        // Rastgele veri oluştur
        const data = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        const startTime = performance.now();
        const startMemory = (window.performance as any).memory?.usedJSHeapSize || 0;

        let comparisons = 0;
        let swaps = 0;

        // Algoritmaları çalıştır
        switch (algo) {
          case "bubble":
            for (let i = 0; i < data.length; i++) {
              for (let j = 0; j < data.length - i - 1; j++) {
                comparisons++;
                if (data[j] > data[j + 1]) {
                  [data[j], data[j + 1]] = [data[j + 1], data[j]];
                  swaps++;
                  if (soundEnabled) playClick();
                }
              }
            }
            break;
          case "quick":
            const quickSort = (arr: number[], low: number, high: number) => {
              if (low < high) {
                const pi = partition(arr, low, high);
                quickSort(arr, low, pi - 1);
                quickSort(arr, pi + 1, high);
              }
            };

            const partition = (arr: number[], low: number, high: number) => {
              const pivot = arr[high];
              let i = low - 1;

              for (let j = low; j < high; j++) {
                comparisons++;
                if (arr[j] < pivot) {
                  i++;
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                  swaps++;
                }
              }

              [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
              swaps++;
              return i + 1;
            };

            quickSort(data, 0, data.length - 1);
            break;
          case "merge":
            const mergeSort = (arr: number[], left: number, right: number) => {
              if (left < right) {
                const mid = Math.floor((left + right) / 2);
                mergeSort(arr, left, mid);
                mergeSort(arr, mid + 1, right);
                merge(arr, left, mid, right);
              }
            };

            const merge = (arr: number[], left: number, mid: number, right: number) => {
              const n1 = mid - left + 1;
              const n2 = right - mid;
              const L = arr.slice(left, mid + 1);
              const R = arr.slice(mid + 1, right + 1);

              let i = 0, j = 0, k = left;

              while (i < n1 && j < n2) {
                comparisons++;
                if (L[i] <= R[j]) {
                  arr[k] = L[i];
                  i++;
                } else {
                  arr[k] = R[j];
                  j++;
                }
                swaps++;
                k++;
              }

              while (i < n1) {
                arr[k] = L[i];
                swaps++;
                i++;
                k++;
              }

              while (j < n2) {
                arr[k] = R[j];
                swaps++;
                j++;
                k++;
              }
            };

            mergeSort(data, 0, data.length - 1);
            break;
          case "insertion":
            for (let i = 1; i < data.length; i++) {
              const key = data[i];
              let j = i - 1;

              while (j >= 0 && data[j] > key) {
                comparisons++;
                data[j + 1] = data[j];
                swaps++;
                j--;
              }
              data[j + 1] = key;
              swaps++;
            }
            break;
          case "linear":
            for (let i = 0; i < data.length; i++) {
              comparisons++;
              if (data[i] === data[data.length - 1]) break;
            }
            break;
          case "binary":
            let left = 0;
            let right = data.length - 1;
            const target = data[data.length - 1];

            while (left <= right) {
              const mid = Math.floor((left + right) / 2);
              comparisons++;

              if (data[mid] === target) break;
              if (data[mid] < target) {
                left = mid + 1;
              } else {
                right = mid - 1;
              }
            }
            break;
          case "jump":
            const n = data.length;
            let step = Math.floor(Math.sqrt(n));
            let prev = 0;
            const jumpTarget = data[n - 1];

            while (data[Math.min(step, n) - 1] < jumpTarget) {
              comparisons++;
              prev = step;
              step += Math.floor(Math.sqrt(n));
              if (prev >= n) break;
            }

            while (data[prev] < jumpTarget) {
              comparisons++;
              prev++;
              if (prev === Math.min(step, n)) break;
            }

            if (data[prev] === jumpTarget) {
              comparisons++;
            }
            break;
          case "dfs":
            const visited = new Set<number>();
            const dfs = (graph: Map<number, number[]>, node: number) => {
              visited.add(node);
              comparisons++;
              const neighbors = graph.get(node) || [];
              for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                  dfs(graph, neighbor);
                }
              }
            };

            // Graf oluştur
            const graph = new Map<number, number[]>();
            for (let i = 0; i < data.length; i++) {
              const neighbors: number[] = [];
              for (let j = 0; j < 2; j++) {
                const neighbor = Math.floor(Math.random() * data.length);
                if (neighbor !== i) neighbors.push(neighbor);
              }
              graph.set(i, neighbors);
            }

            dfs(graph, 0);
            break;
          case "bfs":
            const bfsVisited = new Set<number>();
            const queue: number[] = [0];
            bfsVisited.add(0);

            // Graf oluştur
            const bfsGraph = new Map<number, number[]>();
            for (let i = 0; i < data.length; i++) {
              const neighbors: number[] = [];
              for (let j = 0; j < 2; j++) {
                const neighbor = Math.floor(Math.random() * data.length);
                if (neighbor !== i) neighbors.push(neighbor);
              }
              bfsGraph.set(i, neighbors);
            }

            while (queue.length > 0) {
              const node = queue.shift()!;
              comparisons++;
              const neighbors = bfsGraph.get(node) || [];
              for (const neighbor of neighbors) {
                if (!bfsVisited.has(neighbor)) {
                  bfsVisited.add(neighbor);
                  queue.push(neighbor);
                }
              }
            }
            break;
          case "dijkstra":
            const distances = new Map<number, number>();
            const dijkstraVisited = new Set<number>();

            // Graf oluştur
            const dijkstraGraph = new Map<number, Map<number, number>>();
            for (let i = 0; i < data.length; i++) {
              const edges = new Map<number, number>();
              for (let j = 0; j < 2; j++) {
                const neighbor = Math.floor(Math.random() * data.length);
                if (neighbor !== i) {
                  edges.set(neighbor, Math.floor(Math.random() * 10) + 1);
                }
              }
              dijkstraGraph.set(i, edges);
            }

            // Başlangıç mesafelerini ayarla
            for (let i = 0; i < data.length; i++) {
              distances.set(i, i === 0 ? 0 : Infinity);
            }

            while (dijkstraVisited.size < data.length) {
              let minDistance = Infinity;
              let minNode = -1;

              // En küçük mesafeli düğümü bul
              for (let i = 0; i < data.length; i++) {
                if (!dijkstraVisited.has(i) && (distances.get(i) || Infinity) < minDistance) {
                  minDistance = distances.get(i) || Infinity;
                  minNode = i;
                }
              }

              if (minNode === -1) break;

              dijkstraVisited.add(minNode);
              comparisons++;

              // Komşu düğümleri güncelle
              const edges = dijkstraGraph.get(minNode) || new Map();
              for (const [neighbor, weight] of edges) {
                if (!dijkstraVisited.has(neighbor)) {
                  const newDistance = (distances.get(minNode) || 0) + weight;
                  if (newDistance < (distances.get(neighbor) || Infinity)) {
                    distances.set(neighbor, newDistance);
                  }
                }
              }
            }
            break;
        }

        const endTime = performance.now();
        const endMemory = (window.performance as any).memory?.usedJSHeapSize || 0;

        algorithmResults.push({
          name: algo,
          comparisons,
          swaps,
          elapsedTime: endTime - startTime,
          memoryUsage: (endMemory - startMemory) / 1024 / 1024,
        });
      }

      newResults.push({
        inputSize: size,
        results: algorithmResults,
      });
    }

    setResults(newResults);
    setIsRunning(false);
    if (soundEnabled) playSuccess();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, [selectedAlgorithms, soundEnabled]);

  const chartData = {
    labels: inputSizes,
    datasets: selectedAlgorithms.map((algo, index) => ({
      label: algorithmOptions.find((opt) => opt.value === algo)?.label || algo,
      data: results.map((r) => {
        const result = r.results.find((res) => res.name === algo);
        return result?.elapsedTime || 0;
      }),
      borderColor: [
        "#3b82f6",
        "#ef4444",
        "#22c55e",
        "#f59e0b",
        "#8b5cf6",
      ][index % 5],
      tension: 0.1,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Algoritma Performans Karşılaştırması",
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Çalışma Süresi (ms)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Veri Boyutu",
        },
      },
    },
  };

  return (
    <PageContainer
      title="Algoritma Karşılaştırması"
      description="Farklı algoritmaların performansını karşılaştırın ve analiz edin."
    >
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Karşılaştırılacak Algoritmaları Seçin
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">Ses Efektleri</span>
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {algorithmOptions.map((algo) => (
              <label
                key={algo.value}
                className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedAlgorithms.includes(algo.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAlgorithms([...selectedAlgorithms, algo.value]);
                    } else {
                      setSelectedAlgorithms(
                        selectedAlgorithms.filter((a) => a !== algo.value)
                      );
                    }
                  }}
                  disabled={isRunning}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">{algo.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={runComparison}
              disabled={isRunning || selectedAlgorithms.length < 2}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isRunning ? "Karşılaştırılıyor..." : "Karşılaştır"}
            </button>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">
              Detaylı Sonuçlar
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Veri Boyutu
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Algoritma
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Karşılaştırma
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Takas
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Süre (ms)
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Bellek (MB)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, i) =>
                    result.results.map((algo, j) => (
                      <tr key={`${i}-${j}`}>
                        {j === 0 && (
                          <td
                            rowSpan={result.results.length}
                            className="px-4 py-2 text-sm text-gray-900 align-top"
                          >
                            {result.inputSize}
                          </td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {algorithmOptions.find((opt) => opt.value === algo.name)?.label}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {algo.comparisons.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {algo.swaps.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {algo.elapsedTime.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {algo.memoryUsage.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {showToast && (
          <Toast
            message="Karşılaştırma tamamlandı!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
} 