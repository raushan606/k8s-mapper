import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper } from '@mui/material';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { NodeDetailsPanel } from './NodeDetailsPanel';
import { TopologyData, ResourceType, NodeData } from '../../types/kubernetes';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface TopologyGraphProps {
  initialData: TopologyData;
  namespace: string | null | undefined;
  onLoad?: () => void;
}

// Helper function to generate a position for a node (moved from App.tsx)
const generateNodePosition = (index: number, total: number, namespaceIndex: number) => {
  const radius = 200;
  const angle = (index / total) * 2 * Math.PI;
  const x = radius * Math.cos(angle) + namespaceIndex * 400;
  const y = radius * Math.sin(angle);
  return { x, y };
};

const TopologyGraphInner: React.FC<TopologyGraphProps> = ({ initialData, namespace, onLoad }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    console.log('TopologyGraph: useEffect triggered');
    console.log('TopologyGraph: initialData', initialData);
    console.log('TopologyGraph: namespace', namespace);

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

      // Calculate positions for nodes ensuring all have a position
      const layoutedNodes = Object.entries(nodesByNamespace).flatMap(([ns, nsNodes], nsIndex) => {
        const namespaceX = nsIndex * 600; // Increased spacing between namespaces
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

      // Convert nodes to ReactFlow format
      const flowNodes: Node[] = layoutedNodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position!,
        data: {
          ...node,
          label: node.name,
        },
      }));

      // Convert edges to ReactFlow format with proper styling
      const flowEdges: Edge[] = filteredEdges.map(edge => ({
        ...edge,
        type: 'custom',
        animated: false,
        style: {
          stroke: '#8B5CF6',
          strokeWidth: 2,
          opacity: 0.85,
        },
      }));

      console.log('TopologyGraph: Final flowNodes', flowNodes);
      console.log('TopologyGraph: Final flowEdges', flowEdges);

      setNodes(flowNodes);
      setEdges(flowEdges);
    } else {
      console.log('TopologyGraph: initialData is empty or undefined', initialData);
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
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        height: 380,
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.06)',
        p: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ width: '100%', height: '100%' }}>
        <ReactFlow
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
          style={{
            background: 'transparent',
          }}
        >
          <Background
            color="#F3F4F6"
            gap={16}
            size={1}
            style={{ opacity: 0.2 }}
          />
          <Controls
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px',
            }}
          />
          <MiniMap
            style={{
              backgroundColor: 'rgba(243,244,246,0.9)',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
            nodeColor={() => '#8B5CF6'}
          />
          {selectedNode && (
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </ReactFlow>
      </Box>
    </Paper>
  );
};

export const TopologyGraph: React.FC<TopologyGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TopologyGraphInner {...props} />
    </ReactFlowProvider>
  );
}; 