// 'use client';

// import { createStore, Provider } from 'jotai';
// import dynamic from 'next/dynamic';

// import 'jotai-devtools/styles.css';

// const DevToolsComponent = dynamic(
//   () => import('jotai-devtools').then((mod) => ({ default: mod.DevTools })),
//   { ssr: false }
// );

// const myStore = createStore();

// const StoreProvider = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <Provider store={myStore}>
//       <DevToolsComponent store={myStore} position='bottom-right' />
//       {children}
//     </Provider>
//   );
// };

// export default StoreProvider;

// 'use client';

// import { ReactNode, useEffect, useState } from 'react';

// import { createStore, Provider } from 'jotai';

// import 'jotai-devtools/styles.css';

// const myStore = createStore();

// // Conditional DevTools component
// const DevToolsComponent = () => {
//   const [DevTools, setDevTools] = useState<React.ComponentType<{
//     store: unknown;
//     position: string;
//   }> | null>(null);

//   useEffect(() => {
//     if (process.env.NODE_ENV === 'development') {
//       import('jotai-devtools').then((mod) => ({ default: mod.DevTools }));
//     }
//   }, []);

//   if (process.env.NODE_ENV !== 'development' || !DevTools) {
//     return null;
//   }

//   return <DevTools store={myStore} position='bottom-right' />;
// };

// const StoreProvider = ({ children }: { children: ReactNode }) => {
//   return (
//     <Provider store={myStore}>
//       {children}
//       <DevToolsComponent />
//     </Provider>
//   );
// };

// export default StoreProvider;

'use client';

import { ComponentType, ReactNode, useState } from 'react';

import { createStore, Provider } from 'jotai';

const myStore = createStore();

// Conditional DevTools component
// const DevToolsComponent = () => {
//   const [DevTools, setDevTools] = useState<ComponentType<{
//     store: unknown;
//     position: string;
//   }> | null>(null);

//   if (process.env.NODE_ENV !== 'development' || !DevTools) {
//     return null;
//   }

//   return <DevTools store={myStore} position='bottom-right' />;
// };

const StoreProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={myStore}>
      {children}
      {/* <DevToolsComponent /> */}
    </Provider>
  );
};

export default StoreProvider;
