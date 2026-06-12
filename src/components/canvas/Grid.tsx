import { useMemo } from 'react';
import { Line } from 'react-konva';
import { DEFAULT_MAJOR_GRID_MULTIPLIER } from '@/types/canvas';

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Renders the infinite grid visible inside the current viewport.
 * Lines are drawn in world coordinates so pan/zoom just translate them.
 */
export const Grid = ({ width, height, gridSize, scale, offsetX, offsetY }: GridProps) => {
  const { minorLines, majorLines } = useMemo(() => {
    if (scale <= 0 || width === 0 || height === 0) {
      return { minorLines: [] as number[][], majorLines: [] as number[][] };
    }

    const worldLeft = -offsetX / scale;
    const worldTop = -offsetY / scale;
    const worldRight = worldLeft + width / scale;
    const worldBottom = worldTop + height / scale;

    const startX = Math.floor(worldLeft / gridSize) * gridSize;
    const endX = Math.ceil(worldRight / gridSize) * gridSize;
    const startY = Math.floor(worldTop / gridSize) * gridSize;
    const endY = Math.ceil(worldBottom / gridSize) * gridSize;

    const minor: number[][] = [];
    const major: number[][] = [];

    // Skip minor lines entirely when zoomed far out to keep perf high.
    const drawMinor = scale >= 0.5;

    for (let x = startX; x <= endX; x += gridSize) {
      const isMajor = Math.round(x / gridSize) % DEFAULT_MAJOR_GRID_MULTIPLIER === 0;
      const pts = [x, worldTop, x, worldBottom];
      if (isMajor) major.push(pts);
      else if (drawMinor) minor.push(pts);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      const isMajor = Math.round(y / gridSize) % DEFAULT_MAJOR_GRID_MULTIPLIER === 0;
      const pts = [worldLeft, y, worldRight, y];
      if (isMajor) major.push(pts);
      else if (drawMinor) minor.push(pts);
    }

    return { minorLines: minor, majorLines: major };
  }, [width, height, gridSize, scale, offsetX, offsetY]);

  const strokeMinor = 1 / scale;
  const strokeMajor = 1 / scale;

  return (
    <>
      {minorLines.map((points, i) => (
        <Line
          key={`min-${i}`}
          points={points}
          stroke="#e5e7eb"
          strokeWidth={strokeMinor}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
      {majorLines.map((points, i) => (
        <Line
          key={`maj-${i}`}
          points={points}
          stroke="#cbd5e1"
          strokeWidth={strokeMajor}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
    </>
  );
};
