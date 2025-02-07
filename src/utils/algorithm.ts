import { AlgorithmStats, GraphNode } from "@/types/algorithm";

// Bekleme fonksiyonu
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Rastgele dizi oluşturma
export function generateRandomArray(length: number, min: number = 1, max: number = 100): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// İki elemanı takas etme
export const swap = <T>(arr: T[], i: number, j: number): void => {
  [arr[i], arr[j]] = [arr[j], arr[i]];
};

// İstatistikleri güncelleme
export function updateStats(prev: AlgorithmStats, update: Partial<AlgorithmStats>): AlgorithmStats {
  return {
    ...prev,
    ...update,
    memoryUsage: (window.performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0
  };
}

// Performans ölçümü
export function measurePerformance<T>(fn: () => T): { result: T; elapsedTime: number } {
  const startTime = performance.now();
  const result = fn();
  const elapsedTime = performance.now() - startTime;
  return { result, elapsedTime };
}

// Dizi karşılaştırma
export const compareArrays = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

// Matris döndürme
export const rotateMatrix = <T>(matrix: T[][]): T[][] => {
  const n = matrix.length;
  const result = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j][n - 1 - i] = matrix[i][j];
    }
  }

  return result;
};

// Matris transpozu
export const transposeMatrix = <T>(matrix: T[][]): T[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(cols).fill(0).map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
};

// İki nokta arasındaki Manhattan mesafesi
export function manhattanDistance(node1: GraphNode, node2: GraphNode): number {
  return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}

// İki nokta arasındaki Öklid mesafesi
export function euclideanDistance(node1: GraphNode, node2: GraphNode): number {
  return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
}

// Sayıyı belirli bir aralıkta sınırlama
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

// Renk kodları
export const colors = {
  primary: "bg-blue-500",
  secondary: "bg-gray-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  processing: "bg-yellow-200",
  visited: "bg-blue-200",
  path: "bg-green-200",
  wall: "bg-gray-800",
} as const; 