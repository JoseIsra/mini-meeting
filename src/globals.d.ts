import { ZoidProps } from '@/types/zoid';

declare global {
  interface Window {
    xprops: ZoidProps;
  }
}
