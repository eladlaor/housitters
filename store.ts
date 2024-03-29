import { configureStore } from '@reduxjs/toolkit'

import { userSlice } from './slices/userSlice'
import userReducer from './slices/userSlice'
import { landlordSlice } from './slices/landlordSlice'
import landlordReducer from './slices/landlordSlice'
import { housitterSlice } from './slices/housitterSlice'
import { postSlice } from './slices/createPostSlice'
import { recommendationSlice } from './slices/recommendationSlice'
import recommendationReducer from './slices/recommendationSlice'
import postReducer from './slices/createPostSlice'
import housitterReducer from './slices/housitterSlice'

import { inboxSlice } from './slices/inboxSlice'
import inboxReducer from './slices/inboxSlice'

import { availablePostsSlice } from './slices/availablePostsSlice'
import availablePostsReducer from './slices/availablePostsSlice'

import { favouritesSlice } from './slices/favouritesSlice'
import favouritesReducer from './slices/favouritesSlice'

import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

const persistConfig = {
  key: 'persistedobj',
  storage,
}

const reducers = combineReducers({
  [userSlice.name]: userReducer,
  [landlordSlice.name]: landlordReducer,
  [housitterSlice.name]: housitterReducer,
  [postSlice.name]: postReducer,
  [recommendationSlice.name]: recommendationReducer,
  [inboxSlice.name]: inboxReducer,
  [availablePostsSlice.name]: availablePostsReducer,
  [favouritesSlice.name]: favouritesReducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
  },
  devTools: true,
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
