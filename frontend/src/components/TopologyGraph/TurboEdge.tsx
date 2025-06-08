import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const TurboEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  console.log("TurboEdge rendering, edgePath:", edgePath);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd="url(#arrowhead)"
        style={{
          ...style,
          stroke: 'url(#edge-gradient)',
          strokeWidth: 4,
          opacity: 0.8,
        }}
      />
    </>
  );
};

export default TurboEdge; 