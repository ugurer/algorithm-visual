"use client";

import { motion } from "framer-motion";
import { TreeNode } from "@/types/algorithm";

interface TreeVisualizerProps {
  root: TreeNode | null;
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

const NODE_RADIUS = 25;
const LEVEL_HEIGHT = 80;
const MIN_NODE_SPACING = 60;

export function TreeVisualizer({ root, className }: TreeVisualizerProps) {
  const calculateNodePositions = (
    node: TreeNode | null,
    level: number = 0,
    offset: number = 0,
    positions: Map<number, NodePosition> = new Map()
  ): number => {
    if (!node) return offset;

    const leftWidth = calculateNodePositions(node.left, level + 1, offset, positions);
    const currentX = leftWidth + MIN_NODE_SPACING;
    
    positions.set(node.id, {
      x: currentX,
      y: level * LEVEL_HEIGHT
    });

    const rightWidth = calculateNodePositions(node.right, level + 1, currentX + MIN_NODE_SPACING, positions);
    
    return rightWidth;
  };

  const renderNode = (node: TreeNode, position: NodePosition) => {
    return (
      <g key={node.id}>
        {/* Bağlantı çizgileri */}
        {node.left && (
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            x1={position.x}
            y1={position.y}
            x2={nodePositions.get(node.left.id)?.x || 0}
            y2={nodePositions.get(node.left.id)?.y || 0}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <motion.line
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
            x1={position.x}
            y1={position.y}
            x2={nodePositions.get(node.right.id)?.x || 0}
            y2={nodePositions.get(node.right.id)?.y || 0}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        )}

        {/* Düğüm */}
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          cx={position.x}
          cy={position.y}
          r={NODE_RADIUS}
          className={`${
            node.isProcessing
              ? "fill-yellow-400"
              : node.isVisited
              ? "fill-green-500"
              : "fill-blue-500"
          } transition-colors`}
        />

        {/* Değer */}
        <text
          x={position.x}
          y={position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-sm font-medium"
        >
          {node.value}
        </text>
      </g>
    );
  };

  if (!root) return null;

  const nodePositions = new Map<number, NodePosition>();
  calculateNodePositions(root, 0, 0, nodePositions);

  // SVG boyutlarını hesapla
  let maxX = 0, maxY = 0;
  nodePositions.forEach((pos) => {
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
  });

  return (
    <div className={className}>
      <svg
        width="100%"
        height="100%"
        viewBox={`-${NODE_RADIUS} -${NODE_RADIUS} ${maxX + 2 * NODE_RADIUS} ${maxY + 2 * NODE_RADIUS}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {Array.from(nodePositions.entries()).map(([id, position]) => {
          const node = findNodeById(root, id);
          if (node) return renderNode(node, position);
          return null;
        })}
      </svg>
    </div>
  );
}

function findNodeById(root: TreeNode | null, id: number): TreeNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  
  const left = findNodeById(root.left, id);
  if (left) return left;
  
  return findNodeById(root.right, id);
} 