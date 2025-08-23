import { useEffect, useState } from 'react';

export const useUrlToDataUrl = (urls: string[]) => {
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const convertUrlsToDataUrls = async () => {
    if (urls.length === 0) return;

    setLoading(true);

    try {
      const promises = urls.map(async (url, index) => {
        const response = await fetch(url);
        const blob = await response.blob();

        // Create data URL for preview
        const dataUrl = URL.createObjectURL(blob);

        // Create File object
        const filename = url.split('/').pop() || `image-${index + 1}.jpg`;
        const file = new File([blob], filename, { type: blob.type });

        return { dataUrl, file };
      });

      const results = await Promise.all(promises);
      setDataUrls(results.map((r) => r.dataUrl));
      setFiles(results.map((r) => r.file));
    } catch (error) {
      console.error('Error converting URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    convertUrlsToDataUrls();

    // Cleanup object URLs on unmount
    return () => {
      dataUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urls]);

  return { dataUrls, files, loading };
};
