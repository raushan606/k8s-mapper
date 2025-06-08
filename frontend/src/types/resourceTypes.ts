export type ResourceType = 'POD' | 'INGRESS' | 'SERVICE' | 'DEPLOYMENT' | 'REPLICASET' | 'SECRETS' | 'CONFIGMAP' | 'PVC' | 'PV';

export interface K8sNode {
    id: string;
    name: string;
    type: string;
}

export interface K8sEdge {
    fromId: string;
    toId: string;
}

export interface Namespace {
    id: string; // Added id property
    name: string;
    nodes: K8sNode[];
    edges: K8sEdge[];
}