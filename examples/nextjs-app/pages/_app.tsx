import { SecureLendProvider } from '@securelend/react';
import '@securelend/widgets/src/styles.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Header } from '../components/Header';

function MyApp({ Component, pageProps }: AppProps) {
  // The API key is optional but recommended for production usage.
  const config = {
    apiKey: process.env.NEXT_PUBLIC_SECURELEND_API_KEY,
    serverUrl: '/api/mcp',
  };

  return (
    <SecureLendProvider config={config}>
      <Header />
      <Component {...pageProps} />
    </SecureLendProvider>
  );
}

export default MyApp;
