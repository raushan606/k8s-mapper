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
import { Box, Paper, Grid, Typography } from '@mui/material';
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
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#fff',
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
            width: '100%',
            height: '100%',
          }}
        >
          <Background
            color="#F3F4F6"
            gap={16}
            size={1}
            style={{ opacity: 0.2 }}
          />
          <Controls
            position='top-left'
            style={{

              left: 10,
              top: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid #E5E7EB',
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
              border: '1px solid #ed3',
              borderRadius: '4px',
            }}
            nodeColor={() => '#8B5CF6'}
          />
          {selectedNode && (
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
          {/* <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 10,
          }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #E5E7EB',
                  minHeight: 120,
                  backdropFilter: 'blur(8px)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                    Cluster Health
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>3/3 Ready</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>28/30 Running</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>12 Active</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #E5E7EB',
                  minHeight: 120,
                  backdropFilter: 'blur(8px)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                    Resource Usage
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>CPU 67%</Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>Memory 54%</Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>Storage 32%</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid #E5E7EB',
                  minHeight: 120,
                  backdropFilter: 'blur(8px)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                    Recent Events
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>Pod Created</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Service Updated</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Node Warning</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box> */}
        </ReactFlow>
      </Box>
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