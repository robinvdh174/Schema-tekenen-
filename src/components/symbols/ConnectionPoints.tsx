import { Circle } from 'react-konva';
import type { ConnectionPointDefinition } from '@/types/symbols';

interface ConnectionPointsProps {
  points: ConnectionPointDefinition[];
  visible: boolean;
  scale: number;
}

export const ConnectionPoints = ({ points, visible, scale }: ConnectionPointsProps) => {
  if (!visible) return null;
  const radius = 3 / Math.max(scale, 0.25);
  return (
    <>
      {points.map((p) => (
        <Circle
          key={p.id}
          x={p.x}
          y={p.y}
          radius={radius}
          stroke="#2563eb"
          strokeWidth={1.5 / Math.max(scale, 0.25)}
          fill="#ffffff"
          listening={false}
        />
      ))}
    </>
  );
};
