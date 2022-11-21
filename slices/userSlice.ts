import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface UserState {
  isLogged: boolean
  firstName: string
  primaryUse: string
}

const initialState: UserState = {
  isLogged: false,
  firstName: '',
  primaryUse: '',
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
    setPrimaryUse(state = initialState, action) {
      return {
        ...state,
        primaryUse: action.payload,
      }
    },
  },

  // TODO: not sure if should add the extraReducers here as that cursed tutorial said
})

// Action creators are generated (automatically) for each case reducer function
export const { setAuthState, setFirstName, setPrimaryUse } = userSlice.actions

export const selectAuthState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName
export const selectPrimaryUseState = (state: RootState) => state.user.primaryUse

export default userSlice.reducer
