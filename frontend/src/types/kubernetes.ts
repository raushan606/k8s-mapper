import { Node, Edge, XYPosition } from 'reactflow';

export const enum ResourceType {
  NAMESPACE = 'namespace',
  POD = 'pod',
  SERVICE = 'service',
  INGRESS = 'ingress',
  DEPLOYMENT = 'deployment',
  REPLICASET = 'replicaset',
}

export interface KubernetesResource {
  id: string;
  name: string;
  type: ResourceType;
  namespace: string;
  position?: XYPosition;
  status?: string;
  labels?: Record<string, string>;
}

export interface NodeData extends KubernetesResource {
  cpu?: string;
  ram?: string;
  role?: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface TopologyData {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface K8sWebSocketData {
  namespaces: {
    [key: string]: {
      name: string;
      nodes: NodeData[];
      edges: EdgeData[];
    };
  };
  nodes?: NodeData[];
  edges?: EdgeData[];
}

export const convertToReactFlowFormat = (data: TopologyData | K8sWebSocketData): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if ('namespaces' in data) {
    // Handle K8sWebSocketData format
    Object.entries(data.namespaces).forEach(([namespaceId, namespaceData]) => {
      // Add namespace node
      nodes.push({
        id: namespaceId,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          id: namespaceId,
          name: namespaceData.name,
          type: ResourceType.NAMESPACE,
          namespace: namespaceId,
          position: { x: 0, y: 0 },
        },
      });

      // Add nodes for this namespace
      namespaceData.nodes.forEach((node) => {
        nodes.push({
          id: node.id,
          type: 'custom',
          position: node.position || { x: 0, y: 0 },
          data: {
            ...node,
            namespace: namespaceId,
          },
        });
      });

      // Add edges for this namespace
      namespaceData.edges.forEach((edge, index) => {
        edges.push({
          id: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'custom',
        });
      });
    });
  } else {
    // Handle TopologyData format
    data.nodes.forEach((node) => {
      nodes.push({
        id: node.id,
        type: 'custom',
        position: node.position || { x: 0, y: 0 },
        data: node,
      });
    });

    data.edges.forEach((edge, index) => {
      edges.push({
        id: `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        type: 'custom',
      });
    });
  }

  return { nodes, edges };
}; 