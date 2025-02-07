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
import { sleep, measurePerformance, updateStats } from "@/utils/algorithm";

type AlgorithmType = "astar" | "minimax" | "genetic";

interface GridNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  isWall: boolean;
  isPath: boolean;
  isVisited: boolean;
  parent: GridNode | null;
}

const algorithmOptions: AlgorithmOption[] = [
  { value: "astar", label: "A* Pathfinding" },
  { value: "minimax", label: "Minimax Algoritması" },
  { value: "genetic", label: "Genetik Algoritma" },
];

const getAlgorithmCode = (type: AlgorithmType): string => {
  switch (type) {
    case "astar":
      return `// A* Pathfinding algoritması
interface Node {
  x: number;
  y: number;
  f: number; // Toplam maliyet (g + h)
  g: number; // Başlangıçtan bu noktaya maliyet
  h: number; // Tahmini hedef maliyeti
  parent: Node | null;
}

function astar(start: Node, end: Node, grid: number[][]) {
  const openSet: Node[] = [start];
  const closedSet: Node[] = [];
  
  while (openSet.length > 0) {
    // En düşük f değerine sahip düğümü bul
    let current = openSet[0];
    let currentIndex = 0;
    
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < current.f) {
        current = openSet[i];
        currentIndex = i;
      }
    }
    
    // Hedefe ulaştık mı?
    if (current.x === end.x && current.y === end.y) {
      const path: Node[] = [];
      let temp = current;
      
      while (temp.parent) {
        path.push(temp);
        temp = temp.parent;
      }
      
      return path.reverse();
    }
    
    // Mevcut düğümü işle
    openSet.splice(currentIndex, 1);
    closedSet.push(current);
    
    // Komşuları kontrol et
    const neighbors = getNeighbors(current, grid);
    
    for (const neighbor of neighbors) {
      if (closedSet.includes(neighbor)) continue;
      
      const tentativeG = current.g + 1;
      
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeG >= neighbor.g) {
        continue;
      }
      
      neighbor.parent = current;
      neighbor.g = tentativeG;
      neighbor.h = heuristic(neighbor, end);
      neighbor.f = neighbor.g + neighbor.h;
    }
  }
  
  return null; // Yol bulunamadı
}

function heuristic(a: Node, b: Node): number {
  // Manhattan mesafesi
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}`;
    case "minimax":
      return `// Minimax algoritması (Tic-tac-toe örneği)
function minimax(board: string[][], depth: number, isMax: boolean): number {
  const score = evaluate(board);
  
  // Terminal durumları kontrol et
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  if (!hasMovesLeft(board)) return 0;
  
  if (isMax) {
    let best = -1000;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "X";
          best = Math.max(best, minimax(board, depth + 1, !isMax));
          board[i][j] = "";
        }
      }
    }
    
    return best;
  } else {
    let best = 1000;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "O";
          best = Math.min(best, minimax(board, depth + 1, !isMax));
          board[i][j] = "";
        }
      }
    }
    
    return best;
  }
}`;
    case "genetic":
      return `// Genetik algoritma örneği
interface Individual {
  genes: number[];
  fitness: number;
}

class GeneticAlgorithm {
  populationSize: number;
  mutationRate: number;
  population: Individual[];
  
  constructor(size: number, mutationRate: number) {
    this.populationSize = size;
    this.mutationRate = mutationRate;
    this.population = this.initializePopulation();
  }
  
  initializePopulation(): Individual[] {
    return Array(this.populationSize)
      .fill(null)
      .map(() => ({
        genes: this.generateRandomGenes(),
        fitness: 0
      }));
  }
  
  evolve() {
    // Uygunluk değerlerini hesapla
    this.evaluateFitness();
    
    // En iyi bireyleri seç
    const parents = this.selection();
    
    // Yeni nesil oluştur
    const offspring = this.crossover(parents);
    
    // Mutasyon uygula
    this.mutation(offspring);
    
    // Yeni nesili güncelle
    this.population = offspring;
  }
  
  selection(): Individual[] {
    // Turnuva seçimi
    return this.population
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, this.populationSize / 2);
  }
  
  crossover(parents: Individual[]): Individual[] {
    const offspring: Individual[] = [];
    
    while (offspring.length < this.populationSize) {
      const parent1 = this.randomSelect(parents);
      const parent2 = this.randomSelect(parents);
      
      const child = this.crossoverPair(parent1, parent2);
      offspring.push(child);
    }
    
    return offspring;
  }
  
  mutation(population: Individual[]) {
    for (const individual of population) {
      if (Math.random() < this.mutationRate) {
        const index = Math.floor(Math.random() * individual.genes.length);
        individual.genes[index] = Math.random();
      }
    }
  }
}`;
  }
};

// Minimax algoritması için yardımcı fonksiyonlar
const checkWinner = (board: Array<Array<"X" | "O" | "">>) => {
  // Yatay kontrol
  for (let row = 0; row < 3; row++) {
    if (board[row][0] && board[row][0] === board[row][1] && board[row][0] === board[row][2]) {
      return board[row][0];
    }
  }

  // Dikey kontrol
  for (let col = 0; col < 3; col++) {
    if (board[0][col] && board[0][col] === board[1][col] && board[0][col] === board[2][col]) {
      return board[0][col];
    }
  }

  // Çapraz kontrol
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return board[0][0];
  }
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return board[0][2];
  }

  // Beraberlik kontrolü
  if (board.every(row => row.every(cell => cell !== ""))) {
    return "tie";
  }

  return null;
};

const minimax = (board: Array<Array<"X" | "O" | "">>, depth: number, isMax: boolean): number => {
  const winner = checkWinner(board);

  // Terminal durumları kontrol et
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (winner === "tie") return 0;

  // Maksimize eden oyuncu (Bilgisayar - O)
  if (isMax) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "O";
          const score = minimax(board, depth + 1, false);
          board[i][j] = "";
          bestScore = Math.max(bestScore, score);
        }
      }
    }
    return bestScore;
  } 
  // Minimize eden oyuncu (İnsan - X)
  else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = "X";
          const score = minimax(board, depth + 1, true);
          board[i][j] = "";
          bestScore = Math.min(bestScore, score);
        }
      }
    }
    return bestScore;
  }
};

const findBestMove = (board: Array<Array<"X" | "O" | "">>) => {
  let bestScore = -Infinity;
  let bestMove = { row: -1, col: -1 };

  // Tüm boş hücreleri kontrol et
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "") {
        board[i][j] = "O";
        const score = minimax(board, 0, false);
        board[i][j] = "";

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: i, col: j };
        }
      }
    }
  }

  return bestMove;
};

export default function AIPage() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>("astar");
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

  const learningSteps: LearningStep[] = [
    {
      title: "Yapay Zeka Algoritmaları",
      description: "Yapay zeka algoritmaları, bilgisayarların insan benzeri düşünme ve problem çözme yetenekleri kazanmasını sağlar.",
    },
    {
      title: "A* Pathfinding",
      description: "A* algoritması, en kısa yolu bulmak için kullanılan akıllı bir arama algoritmasıdır.",
      code: getAlgorithmCode("astar"),
    },
    {
      title: "Minimax Algoritması",
      description: "Minimax, oyun teorisinde kullanılan ve rakibin en iyi hamlesini tahmin etmeye çalışan bir algoritmadır.",
      code: getAlgorithmCode("minimax"),
    },
    {
      title: "Genetik Algoritma",
      description: "Genetik algoritmalar, doğal seçilim prensiplerini kullanarak optimizasyon problemlerini çözen bir yaklaşımdır.",
      code: getAlgorithmCode("genetic"),
    },
  ];

  // Grid için state
  const [grid, setGrid] = useState<GridNode[][]>(() => {
    const rows = 15;
    const cols = 15;
    return Array(rows).fill(null).map((_, i) => 
      Array(cols).fill(null).map((_, j) => ({
        x: i,
        y: j,
        f: 0,
        g: 0,
        h: 0,
        isWall: false,
        isPath: false,
        isVisited: false,
        isStart: false,
        isTarget: false,
        parent: null
      }))
    );
  });

  // Tic-tac-toe board için state
  const [board, setBoard] = useState<Array<Array<"X" | "O" | "">>>(
    Array(3).fill(null).map(() => Array(3).fill(""))
  );

  // Genetik algoritma için popülasyon state'i
  const [population, setPopulation] = useState<Array<{
    genes: number[];
    fitness: number;
  }>>([]);

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

  const runAstar = async () => {
    if (!grid.some(row => row.some(cell => cell.isStart)) || 
        !grid.some(row => row.some(cell => cell.isTarget))) {
      alert("Lütfen başlangıç ve hedef noktalarını seçin!");
      return;
    }

    let operations = 0;
    const newGrid = [...grid];
    
    // Başlangıç ve hedef noktalarını bul
    let start: [number, number] = [0, 0];
    let target: [number, number] = [0, 0];
    
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].isStart) start = [i, j];
        if (grid[i][j].isTarget) target = [i, j];
      }
    }

    // A* algoritması
    const openSet = new Set([[start[0], start[1]].toString()]);
    const closedSet = new Set<string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const cameFrom = new Map<string, string>();

    gScore.set(start.toString(), 0);
    fScore.set(start.toString(), manhattanDistance(start[0], start[1], target[0], target[1]));

    while (openSet.size > 0) {
      await checkPause();
      operations++;

      // En düşük f değerine sahip düğümü bul
      let current = Array.from(openSet).reduce((a, b) => 
        (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
      );

      const [currentRow, currentCol] = current.split(",").map(Number);

      if (currentRow === target[0] && currentCol === target[1]) {
        // Yolu oluştur
        let path = [current];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!;
          path.unshift(current);
        }

        // Yolu görselleştir
        path.forEach(pos => {
          const [row, col] = pos.split(",").map(Number);
          newGrid[row][col].isPath = true;
        });
        setGrid(newGrid);
        break;
      }

      openSet.delete(current);
      closedSet.add(current);

      // Hücreyi işaretleme
      newGrid[currentRow][currentCol].isProcessing = true;
      newGrid[currentRow][currentCol].isVisited = true;
      setGrid([...newGrid]);
      if (soundEnabled) playClick();

      await sleep(speed);

      // Komşuları kontrol et
      const neighbors = [
        [currentRow - 1, currentCol],
        [currentRow + 1, currentCol],
        [currentRow, currentCol - 1],
        [currentRow, currentCol + 1],
      ];

      for (const [nRow, nCol] of neighbors) {
        if (nRow < 0 || nRow >= grid.length || nCol < 0 || nCol >= grid[0].length) continue;
        if (grid[nRow][nCol].isWall) continue;

        const neighbor = [nRow, nCol].toString();
        if (closedSet.has(neighbor)) continue;

        const tentativeGScore = (gScore.get(current) || Infinity) + 1;

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        } else if (tentativeGScore >= (gScore.get(neighbor) || Infinity)) {
          continue;
        }

        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + manhattanDistance(nRow, nCol, target[0], target[1]));

        newGrid[nRow][nCol].g = tentativeGScore;
        newGrid[nRow][nCol].h = manhattanDistance(nRow, nCol, target[0], target[1]);
        newGrid[nRow][nCol].f = tentativeGScore + newGrid[nRow][nCol].h;
      }

      newGrid[currentRow][currentCol].isProcessing = false;
      setGrid([...newGrid]);
    }

    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  };

  const runMinimax = async () => {
    // Minimax zaten handleBoardClick içinde çalışıyor
    return;
  };

  const runGenetic = async () => {
    let operations = 0;
    const populationSize = 20;
    const generations = 50;
    const mutationRate = 0.1;

    // Rastgele popülasyon oluştur
    let currentPopulation = Array(populationSize).fill(null).map(() => ({
      genes: Array(10).fill(0).map(() => Math.random()),
      fitness: 0
    }));

    // Nesiller boyunca evrim
    for (let gen = 0; gen < generations; gen++) {
      await checkPause();
      operations++;

      // Fitness değerlerini hesapla (örnek olarak, genlerin toplamı)
      currentPopulation.forEach(individual => {
        individual.fitness = individual.genes.reduce((sum, gene) => sum + gene, 0) / individual.genes.length;
      });

      // Popülasyonu güncelle
      setPopulation([...currentPopulation]);
      if (soundEnabled) playClick();

      await sleep(speed);

      // Seçilim
      const parents = currentPopulation
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, populationSize / 2);

      // Yeni nesil oluştur
      const offspring: typeof currentPopulation = [];
      while (offspring.length < populationSize) {
        const parent1 = parents[Math.floor(Math.random() * parents.length)];
        const parent2 = parents[Math.floor(Math.random() * parents.length)];

        // Çaprazlama
        const childGenes = parent1.genes.map((gene, i) => 
          Math.random() < 0.5 ? gene : parent2.genes[i]
        );

        // Mutasyon
        childGenes.forEach((gene, i) => {
          if (Math.random() < mutationRate) {
            childGenes[i] = Math.random();
          }
        });

        offspring.push({
          genes: childGenes,
          fitness: 0
        });
      }

      currentPopulation = offspring;
    }

    if (soundEnabled) playSuccess();
    setStats(prev => updateStats(prev, { operations }));
  };

  const runCode = useCallback(async () => {
    if (isRunning && !isPaused) return;

    try {
      const startTime = performance.now();
      setIsRunning(true);
      setIsPaused(false);
      pauseRef.current = false;

      switch (selectedAlgorithm) {
        case "astar":
          await runAstar();
          break;
        case "minimax":
          await runMinimax();
          break;
        case "genetic":
          await runGenetic();
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
  }, [selectedAlgorithm, grid, speed, soundEnabled, isRunning, isPaused]);

  // Manhattan mesafesi hesaplama yardımcı fonksiyonu
  const manhattanDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };

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
    }
  ];

  // Grid hücresine tıklama
  const handleGridClick = (row: number, col: number) => {
    if (isRunning) return;

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (!grid.some(row => row.some(cell => cell.isStart))) {
      cell.isStart = true;
    } else if (!grid.some(row => row.some(cell => cell.isTarget))) {
      cell.isTarget = true;
    } else {
      cell.isWall = !cell.isWall;
    }

    setGrid(newGrid);
  };

  // Tic-tac-toe board'una tıklama
  const handleBoardClick = async (row: number, col: number) => {
    // Eğer kare doluysa veya oyun devam etmiyorsa çık
    if (board[row][col] !== "" || isRunning) return;

    setIsRunning(true);

    try {
      // Oyuncu hamlesi
      const newBoard = board.map(row => [...row]);
      newBoard[row][col] = "X";
      setBoard(newBoard);

      // Oyun bitti mi kontrol et
      const winner = checkWinner(newBoard);
      if (winner) {
        if (winner === "tie") {
          alert("Berabere!");
        } else {
          alert(winner === "X" ? "Kazandınız!" : "Kaybettiniz!");
        }
        setIsRunning(false);
        return;
      }

      // Bilgisayarın hamlesi için bekle
      await sleep(300); // Sabit bir bekleme süresi

      // Bilgisayarın hamlesi
      const computerMove = findBestMove(newBoard);
      if (computerMove.row !== -1 && computerMove.col !== -1) {
        newBoard[computerMove.row][computerMove.col] = "O";
        setBoard(newBoard);

        // Oyun bitti mi kontrol et
        const finalWinner = checkWinner(newBoard);
        if (finalWinner) {
          await sleep(100); // Sonucu göstermeden önce kısa bir bekleme
          if (finalWinner === "tie") {
            alert("Berabere!");
          } else {
            alert(finalWinner === "X" ? "Kazandınız!" : "Kaybettiniz!");
          }
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Genetik algoritma için rastgele popülasyon oluşturma
  const initializePopulation = () => {
    const newPopulation = Array(20).fill(null).map(() => ({
      genes: Array(10).fill(0).map(() => Math.random()),
      fitness: 0
    }));
    setPopulation(newPopulation);
  };

  return (
    <PageContainer
      title="Yapay Zeka Algoritmaları"
      description="A*, Minimax ve Genetik algoritmaları görselleştirin ve öğrenin."
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
          setGrid(grid.map(row => row.map(cell => ({
            ...cell,
            isPath: false,
            isVisited: false,
            isProcessing: false,
            f: 0,
            g: 0,
            h: 0
          }))));
          setBoard(Array(3).fill(null).map(() => Array(3).fill("")));
          setPopulation([]);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A* Grid */}
        {selectedAlgorithm === "astar" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">A* Pathfinding</h3>
            <div className="grid grid-cols-15 gap-1 aspect-square">
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    className={`relative cursor-pointer rounded-sm border ${
                      cell.isStart
                        ? "bg-purple-500 border-purple-600"
                        : cell.isTarget
                        ? "bg-red-500 border-red-600"
                        : cell.isPath
                        ? "bg-green-500 border-green-600"
                        : cell.isVisited
                        ? "bg-blue-200 border-blue-300"
                        : cell.isProcessing
                        ? "bg-yellow-200 border-yellow-300"
                        : cell.isWall
                        ? "bg-gray-800 border-gray-900"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                    onClick={() => handleGridClick(i, j)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {!cell.isWall && !cell.isStart && !cell.isTarget && (cell.f > 0 || cell.g > 0 || cell.h > 0) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[8px] text-gray-500">
                          <div>f={cell.f}</div>
                          <div>g={cell.g}</div>
                          <div>h={cell.h}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Tıklayarak başlangıç noktası (mor), hedef nokta (kırmızı) ve duvarları (siyah) ekleyin.</p>
            </div>
          </div>
        )}

        {/* Minimax Board */}
        {selectedAlgorithm === "minimax" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Tic-tac-toe (Minimax)</h3>
            <div className="grid grid-cols-3 gap-2 aspect-square">
              {board.map((row, i) =>
                row.map((cell, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-2xl font-bold cursor-pointer"
                    onClick={() => handleBoardClick(i, j)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: cell ? 1 : 0 }}
                      className={cell === "X" ? "text-blue-500" : "text-red-500"}
                    >
                      {cell}
                    </motion.span>
                  </motion.div>
                ))
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Siz X, bilgisayar O olarak oynar. Minimax algoritması en iyi hamleyi seçer.</p>
            </div>
          </div>
        )}

        {/* Genetic Algorithm */}
        {selectedAlgorithm === "genetic" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Genetik Algoritma</h3>
            <div className="h-64">
              <div className="grid grid-cols-10 h-full gap-1">
                {population.map((individual, i) => (
                  <motion.div
                    key={i}
                    className="bg-blue-500 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${individual.fitness * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Her çubuk bir bireyi temsil eder. Yükseklik, bireyin uygunluk değerini gösterir.</p>
            </div>
          </div>
        )}

        {/* Algorithm Code */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <AlgorithmCode
            title={algorithmOptions.find(opt => opt.value === selectedAlgorithm)?.label || ""}
            code={getAlgorithmCode(selectedAlgorithm)}
          />
        </div>
      </div>

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
            message="İşlem tamamlandı!"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
} 