import '../styles/main.scss'
import HomeNavbar from '../components/HomeNavbar'
import { useState, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { store, persistor } from '../store'
import { Provider as ReduxProvider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { library as fontLibrary } from '@fortawesome/fontawesome-svg-core'
import { faEnvelopeOpenText, faMailBulk, faBoxOpen } from '@fortawesome/free-solid-svg-icons'
import '../i18n'
import { useRouter } from 'next/router'

import Head from 'next/head'
fontLibrary.add(faEnvelopeOpenText, faMailBulk, faBoxOpen)

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())
  const router = useRouter()
  const { locale } = router
  const direction = locale === 'he' ? 'rtl' : 'ltr' // determining the direction based on locale

  /* the following import is for this single purpose: 
  to import js only when the page is loaded on the browser,
  and avoid trying to use 'window' and 'document' objects on ssr (done by nextjs),
  which would cause errors as they are only client-side objects.
  */
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap')
  }, [])

  return (
    <>
      <Head>
        <title>Housitters</title>
      </Head>
      <div dir={direction}>
        <ReduxProvider store={store}>
          <PersistGate persistor={persistor}>
            <SessionContextProvider
              supabaseClient={supabaseClient}
              initialSession={pageProps.initialSession}
            >
              <HomeNavbar className="mb-4" />
              <Component {...pageProps} />
            </SessionContextProvider>
          </PersistGate>
        </ReduxProvider>
      </div>
    </>
  )
}

export default MyApp
