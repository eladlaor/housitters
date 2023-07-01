import '../styles/main.css'
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

fontLibrary.add(faEnvelopeOpenText, faMailBulk, faBoxOpen)

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  /* the following import in order to to only import js when the page is loaded on the browser,
  and avoid trying to use 'window' and 'document' objects on ssr (done by nextjs),
  which would cause errors as they are only client-side objects.
  */
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap')
  }, [])

  return (
    <div>
      <ReduxProvider store={store}>
        <PersistGate persistor={persistor}>
          <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
          >
            <Component {...pageProps} />
          </SessionContextProvider>
        </PersistGate>
      </ReduxProvider>
    </div>
  )
}

export default MyApp
