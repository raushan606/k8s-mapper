import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { TopologyGraph } from './components/TopologyGraph/TopologyGraph';
import { MainLayout } from './components/Layout/MainLayout';
import { Sidebar } from './components/Sidebar/Sidebar';
import { TopologyData, K8sWebSocketData, ResourceType, NodeData as K8sNodeData } from './types/kubernetes';
import { ThemeProvider } from '@mui/material';
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
          podCount: ns.nodes.filter(node => node.type === ResourceType.POD).length,
          color: ns.nodes.some(node => node.type === ResourceType.POD) ? '#3ECF8E' : '#A3A3A3',
        }));
        console.log('Extracted namespaces:', namespaceList);

        // Extract all nodes and edges from namespaces
        const allNodes: K8sNodeData[] = Object.entries(data.namespaces).flatMap(([namespaceId, ns], namespaceIndex) => {
          const namespaceNode: K8sNodeData = {
            id: namespaceId,
            name: ns.name,
            type: ResourceType.NAMESPACE,
            namespace: namespaceId,
            position: { x: namespaceIndex * 400, y: 0 },
          };

          const namespaceNodes: K8sNodeData[] = ns.nodes.map((node, index) => ({
            ...node,
            namespace: namespaceId,
            position: node.position || generateNodePosition(index, ns.nodes.length, namespaceIndex),
            status: node.status || undefined,
            cpu: (node as any).cpu || undefined,
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

  return (
    <ThemeProvider theme={theme}>
      <MainLayout>
        <Sidebar
          namespaces={namespaces}
          selectedNamespace={selectedNamespace}
          onNamespaceSelect={handleNamespaceChange}
        />
        <MainContent 
          namespace={selectedNamespace} 
          initialData={topologyData}
          isLoading={loading}
          error={error}
        />
      </MainLayout>
    </ThemeProvider>
  );
};

export default App;