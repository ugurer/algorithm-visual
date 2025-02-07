"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { ArrowRight } from "lucide-react";

const algorithms = [
  {
    title: "Temel Algoritmalar",
    description: "Özyineleme, döngüler ve temel matematiksel işlemleri görselleştirin.",
    href: "/algorithms/basic",
    icon: "🔰",
  },
  {
    title: "Sıralama Algoritmaları",
    description: "Bubble Sort, Quick Sort, Merge Sort ve Insertion Sort algoritmalarını görselleştirin.",
    href: "/algorithms/sorting",
    icon: "🔄",
  },
  {
    title: "Arama Algoritmaları",
    description: "Linear Search, Binary Search ve Jump Search algoritmalarını görselleştirin.",
    href: "/algorithms/search",
    icon: "🔍",
  },
  {
    title: "Dizi ve Matris İşlemleri",
    description: "Dizi ve matris üzerinde temel işlemleri ve dönüşümleri görselleştirin.",
    href: "/algorithms/array-matrix",
    icon: "📊",
  },
  {
    title: "Ağaç Algoritmaları",
    description: "Binary Search Tree, AVL Tree ve ağaç gezinme algoritmalarını görselleştirin.",
    href: "/algorithms/tree",
    icon: "🌳",
  },
  {
    title: "Graf Algoritmaları",
    description: "DFS, BFS ve Dijkstra algoritmalarını görselleştirin.",
    href: "/algorithms/graph",
    icon: "🕸️",
  },
  {
    title: "Dinamik Programlama",
    description: "Fibonacci, Knapsack ve diğer dinamik programlama problemlerini görselleştirin.",
    href: "/algorithms/dynamic",
    icon: "🧮",
  },
  {
    title: "Yapay Zeka Algoritmaları",
    description: "A*, Minimax ve Genetik algoritmaları görselleştirin.",
    href: "/algorithms/ai",
    icon: "🤖",
  },
  {
    title: "Algoritma Karşılaştırması",
    description: "Farklı algoritmaların performansını karşılaştırın ve analiz edin.",
    href: "/algorithms/compare",
    icon: "📈",
  },
];

export default function HomePage() {
  return (
    <PageContainer
      title="Algoritma Görselleştirici"
      description="Farklı algoritmaların çalışma mantığını adım adım görselleştirin ve öğrenin."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {algorithms.map((algorithm) => (
          <Link key={algorithm.href} href={algorithm.href}>
            <motion.div
              className="group h-full p-6 bg-white rounded-xl shadow-sm border hover:border-blue-500 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-4">{algorithm.icon}</div>
                <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-500 mb-2">{algorithm.title}</h2>
              <p className="text-gray-600">{algorithm.description}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
