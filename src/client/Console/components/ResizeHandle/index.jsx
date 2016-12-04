import React, { PropTypes } from 'react';
import { DraggableCore } from 'react-draggable';

export default function ResizeHandle({ children, onStart, onDrag, onStop }) {
  let startingY;
  return (
    <DraggableCore
      onStart={(e, { y }) => { startingY = y; return onStart(y); }}
      onDrag={(e, { y }) => onDrag(y - startingY)}
      onStop={(e, { y }) => onStop(y - startingY)}
    >
      {children}
    </DraggableCore>
  );
}

ResizeHandle.propTypes = {
  onStart: PropTypes.func.isRequired,
  onDrag: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  children: PropTypes.node,
};
