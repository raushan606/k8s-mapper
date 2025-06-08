import React, { memo, type ReactNode } from 'react';
import { Handle, Position, type Node, type NodeProps } from 'reactflow';
import { FiCloud } from 'react-icons/fi';
import { ResourceType } from '../../types/kubernetes';

// Helper to get icons - we will keep the original logic for now
const getNodeIcon = (type: ResourceType) => {
  switch (type) {
    case ResourceType.NAMESPACE:
      return '📁';
    case ResourceType.POD:
      return '📦';
    case ResourceType.SERVICE:
      return '🔌';
    case ResourceType.DEPLOYMENT:
      return '🚀';
    case ResourceType.INGRESS:
      return '🌐';
    case ResourceType.REPLICASET:
      return '🔄';
    case ResourceType.SECRETS:
      return '🔒';
    case ResourceType.CONFIGMAP:
      return '⚙️';
    default:
      return '❓';
  }
};

export type TurboNodeData = {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
};

const CustomNode = ({ data }: NodeProps<Node<TurboNodeData>>) => {
  return (
    <>
      <div className="cloud gradient">
        <div>
          <FiCloud />
        </div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.data.icon && <div className="icon">{data.data.icon}</div>}
            <div>
              <div className="title">{data.data.title}</div>
              <div className="subtitle">{data.data.subtitle}</div>
            </div>
          </div>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </div>
      </div>
    </>
  );
};

export default memo(CustomNode); 