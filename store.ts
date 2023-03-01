import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import { userSlice } from './slices/userSlice'
import userReducer from './slices/userSlice'
import { houseOwnerSlice } from './slices/houseOwnerSlice'
import houseOwnerReducer from './slices/houseOwnerSlice'
import { housitterSlice } from './slices/housitterSlice'
import housitterReducer from './slices/housitterSlice'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'

const persistConfig = {
  key: 'persistedobj',
  storage,
}

const reducers = combineReducers({
  [userSlice.name]: userReducer,
  [houseOwnerSlice.name]: houseOwnerReducer,
  [housitterSlice.name]: housitterReducer,
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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
