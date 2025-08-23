// import * as React from 'react';

// interface SlotProps extends React.HTMLAttributes<HTMLElement> {
//   children?: React.ReactNode;
// }

// const Slot = React.forwardRef<HTMLElement, SlotProps>(
//   ({ children, ...slotProps }, forwardedRef) => {
//     if (React.isValidElement(children)) {
//       // Get the child's props safely
//       const childProps = (children.props as Record<string, unknown>) || {};

//       // Merge the props
//       const mergedProps = mergeProps(slotProps, childProps);

//       // Handle ref composition
//       const childRef = (
//         children as React.ReactElement & { ref?: React.Ref<unknown> }
//       ).ref;
//       const finalRef = forwardedRef
//         ? composeRefs(forwardedRef, childRef)
//         : childRef;

//       // Clone with proper typing
//       return React.cloneElement(children, {
//         ...mergedProps,
//         ...(finalRef && { ref: finalRef }),
//       });
//     }

//     return React.Children.count(children) > 1
//       ? React.Children.only(null)
//       : null;
//   }
// );

// Slot.displayName = 'Slot';

// // Properly typed event handler
// type EventHandler = (...args: unknown[]) => void;

// // Properly typed mergeProps function
// function mergeProps(
//   slotProps: Record<string, unknown>,
//   childProps: Record<string, unknown>
// ): Record<string, unknown> {
//   // Start with child props
//   const overrideProps: Record<string, unknown> = { ...childProps };

//   // Iterate through child props to handle special cases
//   Object.keys(childProps).forEach((propName) => {
//     const slotPropValue = slotProps[propName];
//     const childPropValue = childProps[propName];

//     const isHandler = /^on[A-Z]/.test(propName);

//     if (isHandler) {
//       // Type event handlers with explicit function signature
//       const slotHandler =
//         typeof slotPropValue === 'function'
//           ? (slotPropValue as EventHandler)
//           : undefined;
//       const childHandler =
//         typeof childPropValue === 'function'
//           ? (childPropValue as EventHandler)
//           : undefined;

//       if (slotHandler && childHandler) {
//         overrideProps[propName] = (...args: unknown[]): void => {
//           childHandler(...args);
//           slotHandler(...args);
//         };
//       } else if (slotHandler) {
//         overrideProps[propName] = slotHandler;
//       }
//     } else if (propName === 'style') {
//       // Merge style objects
//       const slotStyle = slotPropValue as React.CSSProperties | undefined;
//       const childStyle = childPropValue as React.CSSProperties | undefined;
//       overrideProps[propName] = { ...slotStyle, ...childStyle };
//     } else if (propName === 'className') {
//       // Merge classNames
//       const slotClass = typeof slotPropValue === 'string' ? slotPropValue : '';
//       const childClass =
//         typeof childPropValue === 'string' ? childPropValue : '';
//       overrideProps[propName] = [slotClass, childClass]
//         .filter(Boolean)
//         .join(' ');
//     }
//   });

//   // Add any slot props that weren't in child props
//   Object.keys(slotProps).forEach((propName) => {
//     if (!(propName in overrideProps)) {
//       overrideProps[propName] = slotProps[propName];
//     }
//   });

//   return overrideProps;
// }

// // Properly typed composeRefs function
// function composeRefs<T>(
//   ...refs: Array<React.Ref<T> | undefined>
// ): React.RefCallback<T> {
//   return (node: T): void => {
//     refs.forEach((ref) => {
//       if (ref) {
//         if (typeof ref === 'function') {
//           ref(node);
//         } else if ('current' in ref) {
//           (ref as React.MutableRefObject<T>).current = node;
//         }
//       }
//     });
//   };
// }

// export { Slot };

import * as React from 'react';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    if (React.isValidElement(children)) {
      // Get the child's props safely
      const childProps = (children.props as Record<string, unknown>) || {};

      // Merge the props
      const mergedProps = mergeProps(slotProps, childProps);

      // Handle ref composition - ref is now a regular prop in React 19
      const childRef = childProps.ref as React.Ref<unknown> | undefined;
      const finalRef = forwardedRef
        ? composeRefs(forwardedRef, childRef)
        : childRef;

      // Clone with proper typing - include ref as a regular prop
      return React.cloneElement(children, {
        ...mergedProps,
        ...(finalRef && { ref: finalRef }),
      });
    }

    return React.Children.count(children) > 1
      ? React.Children.only(null)
      : null;
  }
);

Slot.displayName = 'Slot';

// Properly typed event handler type
type EventHandler = (...args: unknown[]) => void;

// Properly typed mergeProps function
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  // Start with child props
  const overrideProps: Record<string, unknown> = { ...childProps };

  // Iterate through child props to handle special cases
  Object.keys(childProps).forEach((propName) => {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);

    if (isHandler) {
      // Type event handlers with explicit function signature
      const slotHandler =
        typeof slotPropValue === 'function'
          ? (slotPropValue as EventHandler)
          : undefined;
      const childHandler =
        typeof childPropValue === 'function'
          ? (childPropValue as EventHandler)
          : undefined;

      if (slotHandler && childHandler) {
        overrideProps[propName] = (...args: unknown[]): void => {
          childHandler(...args);
          slotHandler(...args);
        };
      } else if (slotHandler) {
        overrideProps[propName] = slotHandler;
      }
    } else if (propName === 'style') {
      // Merge style objects
      const slotStyle = slotPropValue as React.CSSProperties | undefined;
      const childStyle = childPropValue as React.CSSProperties | undefined;
      overrideProps[propName] = { ...slotStyle, ...childStyle };
    } else if (propName === 'className') {
      // Merge classNames
      const slotClass = typeof slotPropValue === 'string' ? slotPropValue : '';
      const childClass =
        typeof childPropValue === 'string' ? childPropValue : '';
      overrideProps[propName] = [slotClass, childClass]
        .filter(Boolean)
        .join(' ');
    }
  });

  // Add any slot props that weren't in child props
  Object.keys(slotProps).forEach((propName) => {
    if (!(propName in overrideProps)) {
      overrideProps[propName] = slotProps[propName];
    }
  });

  return overrideProps;
}

// Properly typed composeRefs function
function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node: T): void => {
    refs.forEach((ref) => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && typeof ref === 'object' && 'current' in ref) {
          (ref as React.MutableRefObject<T>).current = node;
        }
      }
    });
  };
}

export { Slot };
