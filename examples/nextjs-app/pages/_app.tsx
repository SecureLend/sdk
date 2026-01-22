import { SecureLendProvider } from '@securelend/react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SecureLendProvider>
      <Component {...pageProps} />
    </SecureLendProvider>
  );
}

export default MyApp;
