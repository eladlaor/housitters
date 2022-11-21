import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import { counterSlice } from './slices/counterSlice'
import { userSlice } from './slices/userSlice'
import userReducer from './slices/userSlice'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'

const persistConfig = {
  key: 'persistedobj',
  storage,
}

const reducers = combineReducers({
  [counterSlice.name]: counterReducer,
  [userSlice.name]: userReducer,
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