"use client";

import { motion } from "framer-motion";
import { MatrixCell } from "@/types/algorithm";

interface MatrixVisualizerProps {
  matrix: MatrixCell[][];
  className?: string;
}

export function MatrixVisualizer({ matrix, className }: MatrixVisualizerProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  return (
    <div className={className}>
      <div className="grid gap-1" style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        aspectRatio: `${cols}/${rows}`
      }}>
        {matrix.map((row, i) =>
          row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: (i * cols + j) * 0.05
              }}
              className={`relative flex items-center justify-center rounded-lg border ${
                cell.isHighlighted
                  ? "bg-yellow-400 border-yellow-500"
                  : cell.isProcessing
                  ? "bg-blue-400 border-blue-500"
                  : cell.isVisited
                  ? "bg-green-400 border-green-500"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <span className="text-sm font-medium">
                {cell.value}
              </span>
              {/* Koordinatlar */}
              <div className="absolute top-1 left-1 text-[10px] text-gray-500">
                [{cell.row},{cell.col}]
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 