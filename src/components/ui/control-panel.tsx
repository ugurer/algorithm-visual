import { Play, Pause, RotateCcw, SkipBack, SkipForward, Shuffle } from "lucide-react";

interface ControlPanelProps {
  algorithmOptions: { value: string; label: string }[];
  selectedAlgorithm: string;
  onAlgorithmChange: (value: string) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  onStart: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset: () => void;
  onStepForward?: () => void;
  onStepBack?: () => void;
  onGenerateRandom?: () => void;
  isRunning: boolean;
  isPaused?: boolean;
  canStepForward?: boolean;
  canStepBack?: boolean;
  customControls?: React.ReactNode;
}

export function ControlPanel({
  algorithmOptions,
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  onStart,
  onPause,
  onResume,
  onReset,
  onStepForward,
  onStepBack,
  onGenerateRandom,
  isRunning,
  isPaused,
  canStepForward,
  canStepBack,
  customControls,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">Algoritma</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => onAlgorithmChange(e.target.value)}
              disabled={isRunning}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {algorithmOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Animasyon Hızı: {speed}ms
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {customControls && (
          <div className="flex flex-wrap items-center gap-4">
            {customControls}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {!isRunning ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            >
              <Play size={18} />
              <span>Başlat</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            >
              <Play size={18} />
              <span>Devam Et</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            >
              <Pause size={18} />
              <span>Duraklat</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={isRunning && !isPaused}
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
          >
            <RotateCcw size={18} />
            <span>Sıfırla</span>
          </button>

          {onGenerateRandom && (
            <button
              onClick={onGenerateRandom}
              disabled={isRunning && !isPaused}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all"
            >
              <Shuffle size={18} />
              <span>Rastgele</span>
            </button>
          )}

          {(onStepBack || onStepForward) && (
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              <button
                onClick={onStepBack}
                disabled={!canStepBack || isRunning}
                className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={onStepForward}
                disabled={!canStepForward || isRunning}
                className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                <SkipForward size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 