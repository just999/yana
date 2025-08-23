import { useEffect, useState } from 'react';

export const useUrlToFile = (urls: { src: string; id: string }[]) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertUrlToFile = async (
    url: string,
    filename: string
  ): Promise<File | null> => {
    try {
      // For external URLs, you might need to use a proxy or ensure CORS is handled
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const blob = await response.blob();
      const file = new File([blob], filename, {
        type: blob.type || 'image/jpeg',
      });

      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      return null;
    }
  };

  const convertUrls = async () => {
    if (urls.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const filePromises = urls.map(async (url, index) => {
        const urlParts = url.src.split('/');
        const filename =
          urlParts[urlParts.length - 1] || `image-${index + 1}.jpg`;
        return await convertUrlToFile(url.src, url.id);
      });

      const results = await Promise.all(filePromises);
      const validFiles = results.filter((file): file is File => file !== null);

      setFiles(validFiles);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to convert URLs to files'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    convertUrls();
  }, [urls]);

  return { files, loading, error, refetch: convertUrls };
};
