// Algoritma modları
export type AlgorithmMode = "learning" | "quick" | "challenge";

// Temel istatistikler
export interface AlgorithmStats {
  operations: number;
  elapsedTime: number;
  memoryUsage: number;
}

// Öğrenme adımları
export interface LearningStep {
  title: string;
  description: string;
  code?: string;
}

// Algoritma seçenekleri
export interface AlgorithmOption {
  value: string;
  label: string;
}

// Temel düğüm yapısı
export interface BaseNode {
  id: number;
  value: number;
  isVisited?: boolean;
  isProcessing?: boolean;
}

// Graf düğümü
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  isVisited: boolean;
  isProcessing: boolean;
  isWall: boolean;
  isPath: boolean;
  isStart: boolean;
  isTarget: boolean;
  value: number;
}

// Grid düğümü
export interface GridNode {
  id?: string;
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  isWall: boolean;
  isPath: boolean;
  isVisited: boolean;
  isProcessing: boolean;
  isStart: boolean;
  isTarget: boolean;
  parent: GridNode | null;
}

// Ağaç düğümü
export interface TreeNode extends BaseNode {
  left: TreeNode | null;
  right: TreeNode | null;
  height?: number;
}

// Dizi elemanı
export interface ArrayItem extends BaseNode {
  value: number;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
  isSearching: boolean;
  isFound: boolean;
}

// Matris hücresi
export interface MatrixCell extends BaseNode {
  row: number;
  col: number;
  isHighlighted: boolean;
}

// Debug değişkeni
export interface DebugVariable {
  name: string;
  value: any;
  type: string;
} 