import React from 'react';
import Layout from '../Layout';
import { Toaster } from 'sonner';
import '../styles/globals.css';

function MyApp({ Component, pageProps, router }) {
  const currentPageName = router.pathname.split('/').pop() || 'Home';
  
  return (
    <>
      <Layout currentPageName={currentPageName}>
        <Component {...pageProps} />
      </Layout>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        toastOptions={{
          style: { fontFamily: 'inherit' },
          duration: 4000,
        }}
      />
    </>
  );
}

export default MyApp;