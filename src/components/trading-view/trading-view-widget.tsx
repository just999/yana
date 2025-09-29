'use client';

// TradingViewWidget.jsx
import React, { memo, useEffect, useRef, type RefObject } from 'react';

import useTradingViewWidget from '@/hooks/use-trading-view-widget';
import type { TradingViewWidgetProps } from '@/lib/types';
import { cn } from '@/lib/utils';

function TradingViewWidget({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) {
  const containerRef = useTradingViewWidget({ scriptUrl, config, height });

  return (
    <div className='w-full'>
      {title && (
        <h3 className='mb-5 text-2xl font-semibold text-gray-100'>{title}</h3>
      )}
      <div
        className={cn('tradingview-widget-container', className)}
        ref={containerRef}
      >
        <div
          className='tradingview-widget-container__widget'
          style={{ height, width: '100%' }}
        />
        {/* <div className='tradingview-widget-copyright'>
          <a
            href='https://www.tradingview.com/symbols/NASDAQ-AAPL/'
            rel='noopener nofollow'
            target='_blank'
          >
            <span className='blue-text'>AAPL stock chart</span>
          </a>
          <span className='trademark'> by TradingView</span>
        </div> */}
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
