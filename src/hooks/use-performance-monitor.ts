import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

// Add this to your main component to track all event handlers
export function usePerformanceMonitor() {
  useEffect(() => {
    // Override addEventListener to track all event handlers
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      const wrappedListener = function (this: EventTarget, event: Event) {
        const start = performance.now();

        try {
          // Call original listener
          if (typeof listener === 'function') {
            listener.call(this, event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            listener.handleEvent(event);
          }
        } finally {
          const end = performance.now();
          const duration = end - start;

          // Log slow handlers
          if (duration > 50) {
            console.warn(`🐌 Slow ${type} handler: ${duration.toFixed(2)}ms`, {
              element: this,
              listener:
                typeof listener === 'function'
                  ? listener.name || 'anonymous'
                  : 'anonymous',
              duration,
            });
          }
        }
      };

      // Call original addEventListener with wrapped listener
      originalAddEventListener.call(this, type, wrappedListener, options);
    };

    return () => {
      // Restore original (optional cleanup)
      EventTarget.prototype.addEventListener = originalAddEventListener;
    };
  }, []);
}

// React Component Performance Monitor
// Enhanced ComponentPerformanceWrapper with better debugging
export function ComponentPerformanceWrapper({
  children,
  name,
  threshold = 50, // Configurable threshold
}: {
  children: React.ReactNode;
  name: string;
  threshold?: number;
}) {
  const renderStart = useRef(performance.now());
  const renderCount = useRef(0);

  useLayoutEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    renderCount.current++;

    if (renderTime > threshold) {
      console.warn(
        `🐌 Slow render ${name}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`,
        {
          component: name,
          renderTime,
          renderCount: renderCount.current,
          timestamp: new Date().toISOString(),
        }
      );
    }
  });

  useEffect(() => {
    renderStart.current = performance.now();
  });

  return children;
}

// Input Handler Performance Monitor
export function useInputPerformanceMonitor(
  ref: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const monitorHandler = (type: string) => (event: Event) => {
      const start = performance.now();

      // Let the original event propagate
      setTimeout(() => {
        const end = performance.now();
        const duration = end - start;

        if (duration > 50) {
          console.warn(`🐌 Slow ${type} handler: ${duration.toFixed(2)}ms`, {
            target: event.target,
            element,
          });
        }
      }, 0);
    };

    const inputHandler = monitorHandler('input');
    const changeHandler = monitorHandler('change');
    const keydownHandler = monitorHandler('keydown');

    element.addEventListener('input', inputHandler, { passive: true });
    element.addEventListener('change', changeHandler, { passive: true });
    element.addEventListener('keydown', keydownHandler, { passive: true });

    return () => {
      element.removeEventListener('input', inputHandler);
      element.removeEventListener('change', changeHandler);
      element.removeEventListener('keydown', keydownHandler);
    };
  }, [ref]);
}
