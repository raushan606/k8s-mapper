import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

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
}) => {
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
        markerEnd={markerEnd || 'url(#arrowhead)'}
        style={{
          ...style,
          stroke: '#8B5CF6',
          strokeWidth: 2,
          opacity: 0.85,
          zIndex: 0,
        }}
      />
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="11"
            refY="6"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <polygon points="0 0, 12 6, 0 12, 3 6" fill="#8B5CF6" />
          </marker>
        </defs>
      </svg>
    </>
  );
}; 