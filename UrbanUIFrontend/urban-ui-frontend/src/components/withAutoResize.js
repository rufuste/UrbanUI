import React, { useRef, useState, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

const withAutoResize = (WrappedComponent) => {
  return (props) => {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          const newWidth = entry.contentRect.width;
          const newHeight = entry.contentRect.height;

          // Only update state if dimensions have actually changed
          if (newWidth !== dimensions.width || newHeight !== dimensions.height) {
            setDimensions({
              width: newWidth,
              height: newHeight,
            });
          }
        }
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          resizeObserver.unobserve(containerRef.current);
        }
      };
    }, [dimensions.width, dimensions.height]);

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          //transition: 'width 0.5s, height 1s', // transition for smooth resizing
        }}
      >
        <WrappedComponent {...props} width={dimensions.width} height={dimensions.height} />
      </div>
    );
  };
};

export default withAutoResize;
