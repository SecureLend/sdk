import { SecureLendProvider } from '@securelend/react';
import '@securelend/widgets/src/styles.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Header } from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SecureLendProvider config={{ serverUrl: '/api/mcp' }}>
      <Header />
      <Component {...pageProps} />
    </SecureLendProvider>
  );
}

export default MyApp;
