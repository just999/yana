import { clsx, type ClassValue } from 'clsx';
import { differenceInYears } from 'date-fns';
import { Ballet } from 'next/font/google';
// !Helper function (could be in a separate utils file)
// export async function extractImageUrls(html: string): Promise<string[]> {
//   if (!html) return [];
//   if (typeof window !== 'undefined') {
//     // Browser environment
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, 'text/html');
//     return Array.from(doc.querySelectorAll('img[src^="https://"]')).map(
//       (img) => (img as HTMLImageElement).src
//     );
//   }
//   // Node.js environment (SSR)
//   // const { JSDOM } = require('jsdom');
//   const dom = new JSDOM(html);
//   return Array.from(
//     dom.window.document.querySelectorAll('img[src^="https://"]')
//   ).map((img) => (img as HTMLImageElement).src);
// }

// export async function extractImageUrls(html: string): Promise<string[]> {
//   if (!html) return [];

//   if (typeof window !== 'undefined') {
//     // Browser environment
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, 'text/html');
//     return Array.from(doc.querySelectorAll('img[src^="https://"]')).map(
//       (img) => (img as HTMLImageElement).src
//     );
//   }

//   // For SSR, dynamically import jsdom
//   try {
//     const { JSDOM } = await import('jsdom');
//     const dom = new JSDOM(html);
//     return Array.from(
//       dom.window.document.querySelectorAll('img[src^="https://"]')
//     ).map((img) => (img as HTMLImageElement).src);
//   } catch (error) {
//     console.warn('JSDOM not available in this environment');
//     return [];
//   }
// }

import { parse } from 'node-html-parser';
import qr from 'query-string';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Change formatError to be synchronous since error formatting doesn't need to be async
interface ZodErrorType {
  name: 'ZodError';
  errors: Record<string, { message: string }>;
}

interface PrismaErrorType {
  name: 'PrismaClientKnownRequestError';
  code: string;
  meta?: {
    target?: string[];
  };
}

export const ballet = Ballet({
  variable: '--font-ballet',
  subsets: ['latin'],
});

export function formatError(error: unknown): string {
  // Type guard for ZodError
  const isZodError = (err: unknown): err is ZodErrorType =>
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    err.name === 'ZodError' &&
    'errors' in err;

  // Type guard for PrismaError
  const isPrismaError = (err: unknown): err is PrismaErrorType =>
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    err.name === 'PrismaClientKnownRequestError';

  if (isZodError(error)) {
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );
    return fieldErrors.join(' & ');
  }

  if (isPrismaError(error) && error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} ${error} ${field} already exists`;
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

// export function replaceImageSourcesAndIds(
//   content: string,
//   images: { src: string; id: string; alt: string }[]
// ) {
//   if (!content) return '';
//   // Create a DOMParser to parse the HTML string
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(content, 'text/html');
//   // Get all img tags in the content
//   const imgTags = doc.querySelectorAll('img');

//   // Replace src and data-image-id attributes assuming images array matches the order of img tags
//   imgTags.forEach((img, index) => {
//     const src = img.getAttribute('src');
//     if (images[index] && images[index].src && images[index].id) {
//       img.setAttribute('src', images[index].src);

//       img.setAttribute('data-image-id', images[index].id);
//     }
//   });

//   // Serialize the modified DOM back to a string, extracting the <p> tag content
//   // const pTag = doc.querySelector('p');
//   // return pTag ? pTag.outerHTML : '';
//   return doc.body.innerHTML; // Return the entire body content
// }

export function replaceImageSourcesAndIds(
  content: string,
  images: { src: string; id: string; alt: string }[]
) {
  if (!content) return '';

  let result = content;

  // Find all img tags and replace them one by one
  const imgTagRegex = /<img[^>]*>/g;
  const matches = Array.from(content.matchAll(imgTagRegex));
  matches.forEach((match, index) => {
    if (index < images.length && images[index]) {
      const originalImgTag = match[0];
      const newImage = images[index];
      console.log(`  - Original tag: ${originalImgTag.substring(0, 100)}...`);
      console.log(`  - New src: ${newImage.src.substring(0, 50)}...`);
      console.log(`  - New ID: ${newImage.id}`);

      if (newImage.src && newImage.id) {
        let newImgTag = originalImgTag;

        // Replace or add src attribute
        if (newImgTag.includes('src=')) {
          newImgTag = newImgTag.replace(
            /src="[^"]*"/g,
            `src="${newImage.src}"`
          );
        } else {
          newImgTag = newImgTag.replace('<img', `<img src="${newImage.src}"`);
        }

        // Replace or add data-image-id attribute
        if (newImgTag.includes('data-image-id=')) {
          newImgTag = newImgTag.replace(
            /data-image-id="[^"]*"/g,
            `data-image-id="${newImage.id}"`
          );
        } else {
          newImgTag = newImgTag.replace(
            '<img',
            `<img data-image-id="${newImage.id}"`
          );
        }

        // Replace or add alt attribute if provided
        if (newImage.alt) {
          if (newImgTag.includes('alt=')) {
            newImgTag = newImgTag.replace(
              /alt="[^"]*"/g,
              `alt="${newImage.alt}"`
            );
          } else {
            newImgTag = newImgTag.replace('<img', `<img alt="${newImage.alt}"`);
          }
        }
        // Replace in the result string
        result = result.replace(originalImgTag, newImgTag);
      }
    }
  });

  return result;
}

export function replaceImageSourcesAndIdsDOMBased(
  content: string,
  images: { src: string; id: string; alt: string }[]
) {
  if (!content) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const imgTags = doc.querySelectorAll('img');
  imgTags.forEach((img, index) => {
    if (index < images.length && images[index]) {
      const currentSrc = img.getAttribute('src');
      const newImage = images[index];
      if (newImage.src && newImage.id) {
        // Create a completely new img element
        const newImg = doc.createElement('img');

        // Copy all existing attributes first
        Array.from(img.attributes).forEach((attr) => {
          newImg.setAttribute(attr.name, attr.value);
        });

        // Override with new values
        newImg.setAttribute('src', newImage.src);
        newImg.setAttribute('data-image-id', newImage.id);

        if (newImage.alt) {
          newImg.setAttribute('alt', newImage.alt);
        }

        // Replace the old element with the new one
        img.parentNode?.replaceChild(newImg, img);
        console.log(
          `  - New src: ${newImg.getAttribute('src')?.substring(0, 50)}...`
        );
        console.log(`  - New ID: ${newImg.getAttribute('data-image-id')}`);
      }
    }
  });

  return doc.body.innerHTML;
}

export function replaceImageSourcesAndIdsHybrid(
  content: string,
  images: { src: string; id: string; alt: string }[]
) {
  // First try the DOM-based approach
  let result = replaceImageSourcesAndIdsDOMBased(content, images);

  // Verify if all replacements worked by checking for remaining data URLs
  const remainingDataUrls = (result.match(/src="data:image/g) || []).length;
  const originalDataUrls = (content.match(/src="data:image/g) || []).length;
  // If some replacements failed, fallback to string-based approach
  if (remainingDataUrls > 0) {
    result = replaceImageSourcesAndIds(content, images);
  }

  return result;
}

// utils/breadcrumb.ts
export function getBreadcrumbTrailFromPath(path: string) {
  const segments = path.split('/').filter(Boolean);

  const pathParts = segments.map((segment, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');

    // Optional: Map known segments to display titles
    const labelMap: Record<string, string> = {
      dashboard: 'Dashboard',
      posts: 'Posts',
      edit: 'Edit Post',
      create: 'Create Post',
    };

    return {
      title:
        labelMap[segment] ||
        segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      url: href,
    };
  });

  return pathParts;
}

export function extractImageUrlsServer(
  content: string
): { src: string; id: string }[] {
  if (!content) return [];

  const root = parse(content);
  const images = root.querySelectorAll('img');

  return images.map((img) => {
    const src = img.getAttribute('src') ?? '';
    const name = img.getAttribute('alt') ?? 'image.jpg';
    const id = sanitizeFileName(name);
    return { src, id };
  });
}

export function extractImageUrls(
  content: string
): { src: string; id: string }[] {
  if (!content) return [];

  // Using DOMParser (works in Node.js with jsdom or in the browser)
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const images = doc.querySelectorAll('img');
  // const images = doc.querySelectorAll('img[src^="https://"]');
  // return Array.from(images).map((img) => (img as HTMLImageElement).src);
  return Array.from(images).map((img) => {
    const src = (img as HTMLImageElement).src;
    const name = img.getAttribute('alt') ?? 'image.jpg';
    const id = sanitizeFileName(name);
    return { src, id };
  });
}

export function extractUploadedImages(
  container: HTMLDivElement | string | null
): {
  imageUrl: string;
  imageId: string | null;
  fileName: string;
}[] {
  if (!container) return [];
  let element: HTMLDivElement;

  if (typeof container === 'string') {
    element = document.createElement('div');
    element.innerHTML = container;
  } else {
    element = container;
  }

  return Array.from(element.querySelectorAll('img')).map((img) => {
    const imageUrl = img.getAttribute('src') ?? '';
    const imageId = img.getAttribute('data-image-id');
    const alt = img.getAttribute('alt') || 'image.jpg';

    return { imageUrl, imageId, fileName: alt };
  });
}

export async function extractUploadedImagesFromString(
  content: string
): Promise<{ src: string; id: string | null; file: File | null }[]> {
  const imgRegex = /<img[^>]*>/g;
  const srcRegex = /src="([^"]*)"/;
  const idRegex = /data-image-id="([^"]*)"/;
  const altRegex = /alt="([^"]*)"/;

  const matches = content.match(imgRegex) || [];

  const resolvedImages = await Promise.all(
    matches.map(async (imgTag) => {
      const srcMatch = imgTag.match(srcRegex);
      const idMatch = imgTag.match(idRegex);
      const altMatch = imgTag.match(altRegex);

      const src = srcMatch ? srcMatch[1] : '';
      const id = idMatch ? idMatch[1] : null;
      const filename = altMatch ? altMatch[1] : 'image.jpg';

      const file = src
        ? await urlToFile(src, filename)
        : new File([], filename);

      return { src, id, file };
    })
  );

  return resolvedImages;
}

// Helper function to convert URL to File object
export const urlToFile = async (
  url: string,
  filename: string
): Promise<File | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.statusText}`);
      return null;
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Error converting URL to File:', error);
    return null;
  }
};

// Helper function to convert multiple URLs to File objects
export const convertUrlsToFiles = async (
  imageUrls: string[]
): Promise<File[]> => {
  const filePromises = imageUrls.map(async (url, index) => {
    // Extract filename from URL or create a default one
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || `image-${index + 1}.jpg`;

    return await urlToFile(url, filename);
  });

  const files = await Promise.all(filePromises);
  // Filter out null values (failed conversions)
  return files.filter((file): file is File => file !== null);
};

// Utility functions for cleaning file names
export const cleanFileName = (fileName: string): string => {
  return fileName
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-.]/g, '') // Remove special characters except hyphens and dots
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};
export const sanitizeFileName = (fileName: string): string => {
  // Get file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const name =
    lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

  // Clean the name part
  const cleanName = name
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-_]/g, '') // Keep only alphanumeric, hyphens, and underscores
    .substring(0, 100); // Limit length

  return cleanName + extension;
};

//* */ FORMAT DATE & TIME
// ...existing code...

export const formatDate = {
  /** Format: Mar 9, 2025 2:30 PM */
  dateTime: (date: Date | string) => {
    return new Date(date).toLocaleString('en-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  },

  /** Format: Mar 9, 2025 */
  date: (date: Date | string) => {
    return new Date(date).toLocaleString('en-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  /** Format: 2:30 PM */
  time: (date: Date | string) => {
    return new Date(date).toLocaleString('en-ID', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  },

  /** Format: Sunday, March 9, 2025 */
  full: (date: Date | string) => {
    return new Date(date).toLocaleString('en-ID', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  },
  /** Format UTC date*/
  utc: (date: Date | string) => {
    // return new Date(
    //   date.getUTCFullYear(),
    //   date.getUTCMonth(),
    //   date.getUTCDate(),
    //   date.getUTCHours(),
    //   date.getUTCMinutes(),
    //   date.getUTCSeconds()
    // );
  },

  /** Format: 03/09/2025 */
  numeric: (date: Date | string) => {
    return new Date(date).toLocaleString('en-ID', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  },

  /** Format: 5 minutes ago, 2 hours ago, etc */
  relative: (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now.getTime() - past.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 7) {
      return formatDate.date(date);
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },
};

// export function createDOMElement(htmlString: string): HTMLDivElement {
//   if (typeof window !== 'undefined') {
//     // Client-side
//     const div = document.createElement('div');
//     div.innerHTML = htmlString;
//     return div;
//   } else {
//     // Server-side
//     const dom = new JSDOM(htmlString);
//     return dom.window.document.createElement('div');
//   }
// }

export const extractImageUrlsFromContent = (content: string): string[] => {
  const imgRegex = /<img[^>]+src=['""]([^'""]+)['""][^>]*>/gi;
  const urls: string[] = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
};

export function ensureParagraphStructure(editor: HTMLElement) {
  const childNodes = Array.from(editor.childNodes);

  childNodes.forEach((node) => {
    // Wrap loose text nodes in paragraphs
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const p = document.createElement('p');
      p.textContent = node.textContent;
      editor.replaceChild(p, node);
    }

    // Convert divs to paragraphs
    if (node instanceof HTMLElement && node.nodeName === 'DIV') {
      const p = document.createElement('p');
      p.className = node.className;
      p.innerHTML = node.innerHTML;
      editor.replaceChild(p, node);
    }
  });

  // Ensure at least one paragraph exists
  if (editor.children.length === 0) {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    editor.appendChild(p);
  }
}

export const calculateReadTime = (
  content: string,
  wordsPerMinute: number = 200
): number => {
  // Remove HTML tags if content is in HTML format
  const text = content.replace(/<[^>]*>/g, '');

  // Count words (split by whitespace and filter out empty strings)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // Calculate read time (always round up)
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return readTime;
};

export function summarizeBlogContent(myHTML: string, maxLength = 100) {
  // Step 1: Strip HTML tags using provided regex and clean text
  const plainText = myHTML
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Step 2: Split into sentences
  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];

  // Step 3: Generate summary (first 2-3 sentences or up to maxLength)
  let summary = '';
  let currentLength = 0;
  for (const sentence of sentences) {
    if (currentLength + sentence.length <= maxLength) {
      summary += sentence.trim() + ' ';
      currentLength += sentence.length;
    } else {
      break;
    }
  }

  // Step 4: Fallback if no sentences fit
  if (summary.length === 0 && plainText.length > 0) {
    summary =
      plainText.slice(0, maxLength) +
      (plainText.length > maxLength ? '...' : '');
  }

  return summary.trim() || 'No content available to summarize.';
}

// !Helper function to format numbers (YouTube style)
export const formatCount = (count: number): string => {
  if (count === 0) return '';
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
};

export const calculateAge = (dob: Date) => {
  return differenceInYears(new Date(), dob);
};

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qr.parse(params);

  query[key] = value;

  return qr.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true }
  );
}
