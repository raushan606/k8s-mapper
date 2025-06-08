import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const TurboEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
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