import { motion } from 'motion/react';

interface WaveVisualizerProps {
  isThinking: boolean;
  color: string;
}

export default function WaveVisualizer({ isThinking, color }: WaveVisualizerProps) {
  const barCount = 12;

  return (
    <div className="flex items-end justify-center gap-1 h-8 px-4" id="wave-container">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: isThinking 
              ? [8, Math.random() * 24 + 8, 8] 
              : [8, 12, 8],
            opacity: isThinking ? [0.4, 1, 0.4] : 0.4
          }}
          transition={{
            duration: isThinking ? 0.6 + (i * 0.1) : 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
