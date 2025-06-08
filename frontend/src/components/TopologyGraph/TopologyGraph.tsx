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
  useReactFlow,
  getConnectedEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, useTheme } from '@mui/material';
import CustomNode from './CustomNode';
import TurboEdge from './TurboEdge';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { TopologyData, ResourceType, NodeData } from '../../types/kubernetes';

interface TopologyGraphProps {
  initialData: TopologyData;
  namespace: string | null | undefined;
  onLoad?: () => void;
}

// Helper function to generate a position for a node
const generateNodePosition = (index: number, total: number, namespaceIndex: number) => {
  const radius = 400;
  const angle = (index / total) * 3 * Math.PI;
  const x = radius * Math.cos(angle) + namespaceIndex * 400;
  const y = radius * Math.sin(angle);
  return { x, y };
};

const TopologyGraphInner: React.FC<TopologyGraphProps> = ({ initialData, namespace, onLoad }) => {
  const theme = useTheme();
  const nodeTypes = React.useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = React.useMemo(() => ({ turbo: TurboEdge }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const edgesRef = useRef<Edge[]>([]);

  // Use React Flow's built-in hooks for node data and connections
  const reactFlowInstance = useReactFlow();
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

        console.log("Filter Edges", filteredEdges)

      // Organize nodes by namespace
      const nodesByNamespace = filteredNodes.reduce((acc, node) => {
        const ns = node.namespace || 'default';
        if (!acc[ns]) {
          acc[ns] = [];
        }
        acc[ns].push(node);
        return acc;
      }, {} as Record<string, NodeData[]>);

      // Calculate positions for nodes ensuring all have a position
      const layoutedNodes = Object.entries(nodesByNamespace).flatMap(([ns, nsNodes], nsIndex) => {
        const namespaceX = nsIndex * 600;
        const namespaceY = 0;

        return nsNodes.map((node, index) => {
          let position = node.position;

          if (!position) {
            if (node.type === ResourceType.NAMESPACE) {
              position = { x: namespaceX, y: namespaceY };
            } else {
              position = generateNodePosition(index, nsNodes.length, nsIndex);
            }
          }

          return {
            ...node,
            position: position,
          };
        });
      });

      // Convert nodes to ReactFlow format with computed data
      const flowNodes: Node[] = layoutedNodes.map(node => {
        const nodeData = {
          ...node,
          label: node.name,
          connections: getConnectedEdges([{ id: node.id } as Node], edgesRef.current),
          computedData: allNodes.find(n => n.id === node.id)?.data || {},
        };

        return {
          id: node.id,
          type: 'custom',
          position: node.position!,
          data: nodeData,
        };
      });

      // Convert edges to ReactFlow format with proper styling
      const flowEdges: Edge[] = filteredEdges.map(edge => ({
        ...edge,
        type: 'turbo',
        animated: true,
        markerEnd: 'url(#arrowhead)',
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      console.log("Flow Edges: ", flowEdges)
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [initialData, namespace, setNodes, setEdges]);



  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'transparent',
        borderRadius: 3,
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
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
            background: 'transparent',
            width: '100%',
            height: '100%',
          }}
        >
          <Background
            gap={16}
            size={1}
            style={{ opacity: 0.6 }}
          />
          <svg>
            <defs>
              <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#EC4899" stopOpacity={0.8} />
              </linearGradient>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="9"
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