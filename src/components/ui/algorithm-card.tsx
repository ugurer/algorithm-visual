"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AlgorithmCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  className?: string;
}

export function AlgorithmCard({
  title,
  description,
  href,
  icon,
  className,
}: AlgorithmCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-500 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{description}</p>
          </div>
          <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
            {icon}
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 