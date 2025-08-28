import React, { useEffect, useState } from 'react';

interface WaveformVisualizationProps {
  isActive: boolean;
  className?: string;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ 
  isActive, 
  className = '' 
}) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        // Generate random heights for bars to simulate waveform
        const newBars = Array.from({ length: 20 }, () => Math.random() * 100);
        setBars(newBars);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setBars(Array.from({ length: 20 }, () => 5));
    }
  }, [isActive]);

  return (
    <div className={`flex items-center justify-center gap-1 h-16 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-1 bg-gradient-to-t transition-all duration-100 rounded-full ${
            isActive
              ? 'from-blue-400 to-blue-600'
              : 'from-gray-300 to-gray-400'
          }`}
          style={{
            height: `${isActive ? height : 5}%`,
            animationDelay: `${index * 50}ms`
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualization;
