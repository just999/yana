export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
) => {
  let timeoutId: NodeJS.Timeout;
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};

export const isInlineElement = (element: Element): boolean => {
  const inlineElements = [
    'a',
    'abbr',
    'acronym',
    'b',
    'bdi',
    'bdo',
    'big',
    'br',
    'button',
    'cite',
    'code',
    'dfn',
    'em',
    'i',
    'img',
    'input',
    'kbd',
    'label',
    'map',
    'mark',
    'meter',
    'noscript',
    'object',
    'output',
    'progress',
    'q',
    'ruby',
    's',
    'samp',
    'script',
    'select',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'textarea',
    'time',
    'tt',
    'u',
    'var',
    'wbr',
  ];
  return inlineElements.includes(element.tagName.toLowerCase());
};
