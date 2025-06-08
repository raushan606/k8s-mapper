import dagre from '@dagrejs/dagre';
import { type Node, type Edge, XYPosition } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 170;
const nodeHeight = 100;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') => {
  const numNodes = nodes.length;

  // Dynamically adjust ranksep and nodesep based on the number of nodes
  // These values are experimental and can be fine-tuned.
  const dynamicRanksep = Math.max(150, Math.min(350, 100 + numNodes * 10)); // Base 100, add 5px per node, max 300
  const dynamicNodesep = Math.max(100, Math.min(250, 50 + numNodes * 15));   // Base 50, add 2px per node, max 150

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: dynamicRanksep,
    nodesep: dynamicNodesep,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // We are shifting the dagre node position (anchor=center) to the top-left
    // for React Flow (anchor=top-left).
    const position: XYPosition = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return { ...node, position };
  });

  return { nodes: layoutedNodes, edges };
}; 