import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, MarkerType } from 'reactflow';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  animated,
}) => {
  console.log('CustomEdge rendering for ID:', id);
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd || MarkerType.ArrowClosed}
        style={{
          ...style,
          stroke: '#8B5CF6',
          strokeWidth: 2,
          opacity: 0.85,
          animation: animated ? 'flow 30s linear infinite' : undefined,
        }}
      />
      <style>
        {`
          @keyframes flow {
            from {
              stroke-dashoffset: 100;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon points="0 0, 10 5, 0 10" fill="#8B5CF6" />
          </marker>
        </defs>
      </svg>
    </>
  );
}; 