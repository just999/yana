'use client';

import { useEffect, useRef } from 'react';

type UseTradingViewWidgetProps = {
  scriptUrl: string;
  config: Record<string, unknown>;
  height: number;
};

const useTradingViewWidget = ({
  scriptUrl,
  config,
  height = 600,
}: UseTradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef) return;
    if (containerRef.current?.dataset.loaded) return;

    if (containerRef.current) {
      containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width:100%; height:${height}px;"></div>`;
    }

    const script = document.createElement('script');
    script.src = scriptUrl;
    // script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    containerRef.current?.appendChild(script);
    if (containerRef.current) {
      containerRef.current.dataset.loaded = 'true';
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        delete containerRef.current.dataset.loaded;
      }
    };
  }, [scriptUrl, config, height]);

  return containerRef;
};

export default useTradingViewWidget;
