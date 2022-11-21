import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './slices/counterSlice'
import { counterSlice } from './slices/counterSlice'
import { userSlice } from './slices/userSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    [counterSlice.name]: counterReducer,
    [userSlice.name]: userReducer,
  },
  devTools: true,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
