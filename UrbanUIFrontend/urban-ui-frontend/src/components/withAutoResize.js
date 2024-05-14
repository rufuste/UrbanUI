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
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
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
    }, []);

    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <WrappedComponent {...props} width={dimensions.width} height={dimensions.height} />
      </div>
    );
  };
};

export default withAutoResize;
