import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { TopologyGraph } from './components/TopologyGraph/TopologyGraph';
import { MainLayout } from './components/Layout/MainLayout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopologyData, K8sWebSocketData, ResourceType, NodeData as K8sNodeData } from './types/kubernetes';
import { Box, CircularProgress, Alert, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { MainContent } from './components/Layout/MainContent';

interface Namespace {
  id: string;
  name: string;
  podCount?: number;
  color?: string;
}

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws/topology';

// Helper function to generate a position for a node
const generateNodePosition = (index: number, total: number, namespaceIndex: number) => {
  const radius = 200;
  const angle = (index / total) * 2 * Math.PI;
  const x = radius * Math.cos(angle) + namespaceIndex * 400;
  const y = radius * Math.sin(angle);
  return { x, y };
};

export const App: React.FC = () => {
  const [topologyData, setTopologyData] = useState<TopologyData>({ nodes: [], edges: [] });
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { lastMessage, readyState, sendMessage } = useWebSocket(WS_URL, {
    shouldReconnect: (closeEvent: CloseEvent) => true,
    reconnectInterval: 3000,
    retryOnError: true,
    onOpen: () => {
      console.log('WebSocket connection established');
      setError(null);
    },
    onError: (event: Event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    },
    onClose: (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    },
  });

  useEffect(() => {
    if (lastMessage) {
      try {
        console.log('Raw WebSocket message:', lastMessage.data);
        const data = JSON.parse(lastMessage.data) as K8sWebSocketData;
        console.log('Parsed WebSocket data:', data);

        // Extract namespaces for the dropdown
        const namespaceList = Object.entries(data.namespaces).map(([id, ns]) => ({
          id,
          name: ns.name,
          podCount: ns.nodes.filter(node => node.type === ResourceType.POD).length, // Get pod count
          color: ns.nodes.some(node => node.type === ResourceType.POD) ? '#3ECF8E' : '#A3A3A3', // Example color
        }));
        console.log('Extracted namespaces:', namespaceList);

        // Extract all nodes and edges from namespaces
        const allNodes: K8sNodeData[] = Object.entries(data.namespaces).flatMap(([namespaceId, ns], namespaceIndex) => {
          // Add namespace node (if needed, otherwise rely on the graph layout)
          const namespaceNode: K8sNodeData = {
            id: namespaceId,
            name: ns.name,
            type: ResourceType.NAMESPACE,
            namespace: namespaceId,
            position: { x: namespaceIndex * 400, y: 0 },
          };

          // Add all nodes from this namespace with calculated positions
          const namespaceNodes: K8sNodeData[] = ns.nodes.map((node, index) => ({
            ...node,
            namespace: namespaceId,
            position: node.position || generateNodePosition(index, ns.nodes.length, namespaceIndex),
            // Ensure status, cpu, ram, role are passed if available
            status: node.status || undefined,
            cpu: (node as any).cpu || undefined, // Cast to any to access properties not directly in NodeData if API sends them
            ram: (node as any).ram || undefined,
            role: (node as any).role || undefined,
          }));

          return [namespaceNode, ...namespaceNodes];
        });

        const allEdges = Object.values(data.namespaces).flatMap(ns => ns.edges);

        console.log('All nodes:', allNodes);
        console.log('All edges:', allEdges);

        setNamespaces(namespaceList);
        setTopologyData({
          nodes: allNodes,
          edges: allEdges,
        });
        setLoading(false);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError('Failed to parse WebSocket message');
        setLoading(false);
      }
    }
  }, [lastMessage]);

  const handleNamespaceChange = (namespaceId: string | null) => {
    console.log('Namespace changed to:', namespaceId);
    setSelectedNamespace(namespaceId);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <MainLayout>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <CircularProgress size={24} />
          </Box>
          <Box flex={1} />
        </MainLayout>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <MainLayout>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Alert severity="error" sx={{ maxWidth: 400 }}>
              {error}
            </Alert>
          </Box>
          <Box flex={1} />
        </MainLayout>
      </ThemeProvider>
    );
  }

  console.log('Current topology data:', topologyData);
  console.log('Selected namespace:', selectedNamespace);

  return (
    <ThemeProvider theme={theme}>
      <MainLayout>
        <Sidebar
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceSelect={handleNamespaceChange}
        />
        <MainContent namespace={selectedNamespace} initialData={topologyData}>
          {/* TopologyGraph is now rendered inside MainContent */}
        </MainContent>
      </MainLayout>
    </ThemeProvider>
  );
};

export default App;