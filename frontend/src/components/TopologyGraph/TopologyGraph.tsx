import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useNodes,
  getConnectedEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, useTheme } from '@mui/material';
import CustomNode from './CustomNode';
import TurboEdge from './TurboEdge';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { TopologyData, ResourceType, NodeData } from '../../types/kubernetes';
import { getLayoutedElements } from '../../utils/dagreReactFlowLayout';

interface TopologyGraphProps {
  initialData: TopologyData;
  namespace: string | null | undefined;
  onLoad?: () => void;
}

const TopologyGraphInner: React.FC<TopologyGraphProps> = ({ initialData, namespace, onLoad }) => {
  const theme = useTheme();
  const nodeTypes = React.useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = React.useMemo(() => ({ turbo: TurboEdge }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const edgesRef = useRef<Edge[]>([]);

  // Use React Flow's built-in hooks for node data and connections
  const allNodes = useNodes();

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update edges ref when edges change
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (initialData && initialData.nodes.length > 0) {
      // Filter nodes and edges based on namespace
      const filteredNodes = namespace
        ? initialData.nodes.filter(node => node.namespace === namespace)
        : initialData.nodes;

      const filteredEdges = namespace
        ? initialData.edges.filter(edge => {
          const sourceNode = initialData.nodes.find(n => n.id === edge.source);
          const targetNode = initialData.nodes.find(n => n.id === edge.target);
          return sourceNode?.namespace === namespace && targetNode?.namespace === namespace;
        })
        : initialData.edges;

      // Organize nodes by namespace
      const nodesByNamespace = filteredNodes.reduce((acc, node) => {
        const ns = node.namespace || 'default';
        if (!acc[ns]) {
          acc[ns] = [];
        }
        acc[ns].push(node);
        return acc;
      }, {} as Record<string, NodeData[]>);

      // Identify all target nodes from existing edges
      const existingTargetIds = new Set(filteredEdges.map(edge => edge.target));

      // Add implicit edges from namespace nodes to root resource nodes
      const implicitEdges: Edge[] = [];
      Object.entries(nodesByNamespace).forEach(([namespaceId, nsNodes]) => {
        // Find the namespace node itself
        const namespaceNode = nsNodes.find(node => node.id === namespaceId && node.type === ResourceType.NAMESPACE);

        if (namespaceNode) {
          nsNodes.forEach(node => {
            // If it's a resource node (not the namespace node itself) and has no incoming edges,
            // create an implicit edge from the namespace.
            if (node.type !== ResourceType.NAMESPACE && !existingTargetIds.has(node.id)) {
              implicitEdges.push({
                id: `namespace-${namespaceId}-to-${node.id}`,
                source: namespaceId,
                target: node.id,
                type: 'turbo',
                animated: true,
                markerEnd: 'url(#arrowhead)',
              });
            }
          });
        }
      });

      const combinedEdges = [...filteredEdges, ...implicitEdges];

      console.log("Combined Edges for Layout:", combinedEdges);

      // Prepare nodes for layout, ensuring they have an id, type, and data structure consistent with ReactFlow Node
      const nodesForLayout: Node[] = Object.entries(nodesByNamespace).flatMap(([, nsNodes]) => {
        return nsNodes.map(node => ({
          id: node.id,
          type: 'custom',
          position: { x: 0, y: 0 }, // Initial position for layout algorithm, will be overwritten by dagre
          data: {
            ...node,
            label: node.name,
            connections: getConnectedEdges([{ id: node.id } as Node], edgesRef.current),
            computedData: allNodes.find(n => n.id === node.id)?.data || {},
          },
        }));
      });

      // Apply layout to nodes and edges
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodesForLayout, combinedEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      if (onLoad) {
        onLoad();
      }

    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [initialData, namespace, setNodes, setEdges, onLoad]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'white',
        borderRadius: 0,
        p: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ width: '100%', flex: 1 }}>
        <ReactFlow
          key={JSON.stringify(initialData.nodes.map(node => node.id) || [])}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            type: 'turbo',
            animated: true,
            markerEnd: 'url(#arrowhead)',
          }}
          style={{
            // background: 'transparent',
            width: '100%',
            height: '100%',
          }}
        >
          <Background
            color={theme.palette.mode === 'dark' ? theme.palette.background.default : '#F3F4F6'}
            gap={16}
            size={1}
            style={{ opacity: 0.6 }}
          />
          <svg>
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#11E6F1" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#925CF6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#0C4099" stopOpacity={0.8} />
              </linearGradient>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerUnits="strokeWidth"
                markerWidth="3"
                markerHeight="3"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EC4899" />
              </marker>
            </defs>
          </svg>
          <Controls
            position='top-left'
            style={{
              left: 10,
              top: 10,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              padding: '8px',
            }}
          />
          <MiniMap
            position='top-right'
            nodeStrokeColor={() => '#483'}
            style={{
              right: 10,
              top: 10,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              padding: '8px',
            }}
          />
        </ReactFlow>
      </Box>
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </Box>
  );
};

export const TopologyGraph: React.FC<TopologyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TopologyGraphInner {...props} />
    </ReactFlowProvider>
  );
}; 