import { useEffect, useState, useRef } from 'react';

/**
 * Creates an Object URL from a Blob and automatically revokes it on cleanup.
 * Prevents memory leaks from Object URLs.
 */
export function useAudioUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (blob) {
      const newUrl = URL.createObjectURL(blob);
      urlRef.current = newUrl;
      setUrl(newUrl);
    } else {
      setUrl(null);
    }

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [blob]);

  return url;
}
