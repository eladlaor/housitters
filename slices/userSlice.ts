import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface UserState {
  isLogged: boolean
  firstName: string
  primaryUse: string
  lastName: string
}

const initialState: UserState = {
  isLogged: false,
  firstName: '',
  primaryUse: '',
  lastName: '',
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
    setLastName(state = initialState, action) {
      return {
        ...state,
        lastName: action.payload,
      }
    },
    setPrimaryUse(state = initialState, action) {
      return {
        ...state,
        primaryUse: action.payload,
      }
    },
  },
})

// Action creators are generated (automatically) for each case reducer function
export const { setAuthState, setFirstName, setLastName, setPrimaryUse } = userSlice.actions

export const selectAuthState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName
export const selectLastNameState = (state: RootState) => state.user.lastName
export const selectPrimaryUseState = (state: RootState) => state.user.primaryUse

export default userSlice.reducer
