import { useState, useCallback, useRef, useEffect } from "react";
import { AlgorithmMode, AlgorithmStats } from "@/types/algorithm";
import { sleep, measurePerformance } from "@/utils/algorithm";
import { playClick, playSuccess } from "@/lib/sounds";

interface UseAlgorithmProps {
  initialMode?: AlgorithmMode;
  initialSpeed?: number;
  onComplete?: () => void;
}

export function useAlgorithm({
  initialMode = "quick",
  initialSpeed = 500,
  onComplete,
}: UseAlgorithmProps = {}) {
  // Temel state'ler
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [mode, setMode] = useState<AlgorithmMode>(initialMode);
  const [showLearningCard, setShowLearningCard] = useState(true);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(300);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stats, setStats] = useState<AlgorithmStats>({
    operations: 0,
    elapsedTime: 0,
    memoryUsage: 0,
  });

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const pauseRef = useRef(false);

  // Mod değişikliği
  const handleModeChange = useCallback((newMode: AlgorithmMode) => {
    setMode(newMode);
    if (newMode === "learning") {
      setShowLearningCard(true);
    } else {
      setShowLearningCard(false);
    }
  }, []);

  // Challenge süresi bittiğinde
  const handleChallengeTimeUp = useCallback(() => {
    if (mode === "challenge") {
      setIsRunning(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      if (onComplete) onComplete();
    }
  }, [mode, onComplete]);

  // Duraklatma kontrolü
  const checkPause = useCallback(async () => {
    while (pauseRef.current) {
      await sleep(100);
    }
  }, []);

  // Algoritma çalıştırma
  const runAlgorithm = useCallback(async <T>(
    algorithm: () => Promise<T>,
    options: { playSound?: boolean } = {}
  ) => {
    if (isRunning && !isPaused) return;

    try {
      setIsRunning(true);
      setIsPaused(false);
      pauseRef.current = false;

      const { result, stats: newStats } = await measurePerformance(algorithm);

      if (options.playSound && soundEnabled) {
        playSuccess();
      }

      setStats(newStats);
      return result;
    } catch (error) {
      console.error("Algoritma çalıştırma hatası:", error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, isPaused, soundEnabled]);

  // Durdurma
  const stopAlgorithm = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setIsPaused(false);
    pauseRef.current = false;
  }, []);

  // Duraklatma
  const pauseAlgorithm = useCallback(() => {
    setIsPaused(true);
    pauseRef.current = true;
  }, []);

  // Devam ettirme
  const resumeAlgorithm = useCallback(() => {
    setIsPaused(false);
    pauseRef.current = false;
  }, []);

  // Sıfırlama
  const resetAlgorithm = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    pauseRef.current = false;
    setStats({
      operations: 0,
      elapsedTime: 0,
      memoryUsage: 0,
    });
  }, []);

  // Temizlik
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State'ler
    isRunning,
    isPaused,
    speed,
    mode,
    showLearningCard,
    challengeTimeLeft,
    isDebugMode,
    showToast,
    soundEnabled,
    stats,

    // Setter'lar
    setSpeed,
    setIsDebugMode,
    setSoundEnabled,
    setShowToast,
    setStats,

    // Event handler'lar
    handleModeChange,
    handleChallengeTimeUp,

    // Algoritma kontrolleri
    runAlgorithm,
    stopAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
    resetAlgorithm,
    checkPause,
  };
} 