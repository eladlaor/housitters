import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface UserState {
  isLogged: boolean
  firstName: string
}

const initialState: UserState = {
  isLogged: false,
  firstName: '',
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthState(state = initialState, action) {
      return {
        ...state,
        isLogged: action.payload,
      }
    },
    setFirstName(state = initialState, action) {
      return {
        ...state,
        firstName: action.payload,
      }
    },
  },

  // TODO: not sure if should add the extraReducers here as that cursed tutorial said
})

// Action creators are generated (automatically) for each case reducer function
export const { setAuthState, setFirstName } = userSlice.actions

export const selectAuthState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName

export default userSlice.reducer
