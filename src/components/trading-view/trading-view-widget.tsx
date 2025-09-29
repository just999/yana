'use client';

// TradingViewWidget.jsx
import React, { memo, useEffect, useRef, type RefObject } from 'react';

import useTradingViewWidget from '@/hooks/use-trading-view-widget';
import type { TradingViewWidgetProps } from '@/lib/types';

function TradingViewWidget({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) {
  const containerRef = useTradingViewWidget({ scriptUrl, config, height });

  return (
    <div
      className='tradingview-widget-container'
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className='tradingview-widget-container__widget'
        style={{ height: 'calc(100% - 32px)', width: '100%' }}
      ></div>
      <div className='tradingview-widget-copyright'>
        <a
          href='https://www.tradingview.com/symbols/NASDAQ-AAPL/'
          rel='noopener nofollow'
          target='_blank'
        >
          <span className='blue-text'>AAPL stock chart</span>
        </a>
        <span className='trademark'> by TradingView</span>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
