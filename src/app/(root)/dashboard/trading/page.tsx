import TradingViewWidget from '@/components/trading-view/trading-view-widget';
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

type TradingPageProps = unknown;

const TradingPage = () => {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  return (
    <div className='home-wrapper flex min-h-screen pb-16 lg:max-w-6xl'>
      <section className='home-section grid w-full auto-cols-max grid-flow-col gap-8'>
        <div className='md:col-span-1 xl:col-span-1'>
          <TradingViewWidget
            title='Market Overview'
            scriptUrl={cn(scriptUrl + 'market-overview.js')}
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            className='custom-chart'
            height={600}
          />
        </div>

        <div className='md:col-span-1 xl:col-span-2'>
          <TradingViewWidget
            title='Stock Heatmap'
            scriptUrl={cn(scriptUrl + 'stock-heatmap.js')}
            config={HEATMAP_WIDGET_CONFIG}
            // className='rounded-lg'
            height={600}
          />
        </div>
      </section>
      <section className='home-section grid w-full gap-8'>
        <div className='h-full md:col-span-1 xl:col-span-1'>
          <TradingViewWidget
            // title='Market Overview'
            scriptUrl={cn(scriptUrl + 'timeline.js')}
            config={TOP_STORIES_WIDGET_CONFIG}
            className='custom-chart'
            height={600}
          />
        </div>

        <div className='h-full md:col-span-1 xl:col-span-2'>
          <TradingViewWidget
            // title='Stock Heatmap'
            scriptUrl={cn(scriptUrl + 'market-quotes.js')}
            config={MARKET_DATA_WIDGET_CONFIG}
            // className='custom-chart'
            height={600}
          />
        </div>
      </section>
    </div>
  );
};

export default TradingPage;
