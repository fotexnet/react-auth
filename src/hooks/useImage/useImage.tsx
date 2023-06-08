import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { useEffect, useMemo, useState } from 'react';

function useImage(url: string, config?: UseImageConfig): string {
  const [dataUrl, setDataUrl] = useState<string>('');
  const client = useMemo(() => config?.httpClient || axios, [config?.httpClient]);

  useEffect(() => {
    const controller = new AbortController();

    client
      .get(url, { ...config, responseType: 'blob', signal: controller.signal })
      .then(({ data }) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => setDataUrl(typeof reader.result === 'string' ? reader.result : ''));
        reader.readAsDataURL(data);
      })
      .catch(() => {
        setDataUrl('');
      });

    return () => {
      controller.abort();
    };
  }, []);

  return dataUrl;
}

export default useImage;

export type UseImageConfig = Omit<AxiosRequestConfig, 'responseType' | 'signal'> & { httpClient?: AxiosInstance };
