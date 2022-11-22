import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { USER_TYPE } from '../utils/constants'

export interface UserState {
  isLogged: boolean
  firstName: string
  lastName: string
  username: string
  primaryUse: string
  secondaryUse: string
  avatarUrl: string
  birthday: Date | null
}

const initialState: UserState = {
  isLogged: false,
  firstName: '',
  lastName: '',
  username: '',
  primaryUse: '',
  secondaryUse: USER_TYPE.None,
  avatarUrl: '', // TODO: add some default image here
  birthday: null,
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
    setUsername(state = initialState, action) {
      return {
        ...state,
        username: action.payload,
      }
    },
    setPrimaryUse(state = initialState, action) {
      return {
        ...state,
        primaryUse: action.payload,
      }
    },
    setSecondaryUse(state = initialState, action) {
      return {
        ...state,
        secondaryUse: action.payload,
      }
    },
    setAvatarUrl(state = initialState, action) {
      return {
        ...state,
        avatarUrl: action.payload,
      }
    },
    setBirthday(state = initialState, action) {
      return {
        ...state,
        birthday: action.payload,
      }
    },
  },
})

// Action creators are generated (automatically) for each case reducer function
export const {
  setAuthState,
  setFirstName,
  setLastName,
  setUsername,
  setPrimaryUse,
  setSecondaryUse,
  setAvatarUrl,
  setBirthday,
} = userSlice.actions

export const selectAuthState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName
export const selectLastNameState = (state: RootState) => state.user.lastName
export const selectUsernameState = (state: RootState) => state.user.username
export const selectPrimaryUseState = (state: RootState) => state.user.primaryUse
export const selectSecondaryUseState = (state: RootState) => state.user.secondaryUse
export const selectAvatarUrlState = (state: RootState) => state.user.avatarUrl
export const selectBirthdayState = (state: RootState) => state.user.birthday

export default userSlice.reducer
