import React from 'react';
import { Connection as ConnectionType, Point, calculateConnectionPath } from '@/lib/flowCreator';

interface ConnectionProps {
  connection: ConnectionType;
  sourcePosition: Point;
  targetPosition: Point;
  animating: boolean;
}

const Connection: React.FC<ConnectionProps> = ({
  connection,
  sourcePosition,
  targetPosition,
  animating
}) => {
  const pathData = calculateConnectionPath(sourcePosition, targetPosition);
  
  return (
    <g>
      <path
        id={`connection-${connection.id}`}
        className={`connection-path ${animating || connection.animating ? 'animate-connection' : ''}`}
        d={pathData}
        stroke="#4F46E5"
        strokeWidth="2"
        fill="none"
        strokeDasharray="5"
        markerEnd="url(#arrowhead)"
        style={{
          animation: (animating || connection.animating) ? 'dash 30s linear infinite' : 'none'
        }}
      />
    </g>
  );
};

export default Connection;
