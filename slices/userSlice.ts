import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { USER_TYPE } from '../utils/constants'
import { User } from '@supabase/supabase-js'
import { keys } from 'ts-transformer-keys'
import { debug } from 'node:console'
import { initScriptLoader } from 'next/script'

export const initialState = {
  isLogged: false,
  firstName: '',
  lastName: '',
  username: '',
  primaryUse: '',
  secondaryUse: USER_TYPE.None,
  avatarUrl: '', // TODO: add some default image here
  birthday: new Date(0),
  availability: [
    {
      startDate: new Date(0),
      endDate: new Date(0),
    },
  ],
}

export type UserState = typeof initialState

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsLoggedState(state = initialState, action) {
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
    setAvailability(state = initialState, action) {
      return {
        ...state,
        availability: action.payload,
      }
    },
  },
})

// Action creators are generated (automatically) for each case reducer function
export const {
  setIsLoggedState,
  setFirstName,
  setLastName,
  setUsername,
  setPrimaryUse,
  setSecondaryUse,
  setAvatarUrl,
  setBirthday,
  setAvailability,
} = userSlice.actions

export const selectIsLoggedState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName
export const selectLastNameState = (state: RootState) => state.user.lastName
export const selectUsernameState = (state: RootState) => state.user.username
export const selectPrimaryUseState = (state: RootState) => state.user.primaryUse
export const selectSecondaryUseState = (state: RootState) => state.user.secondaryUse
export const selectAvatarUrlState = (state: RootState) => state.user.avatarUrl
export const selectBirthdayState = (state: RootState) => state.user.birthday
export const selectAvailabilityState = (state: RootState) => state.user.availability

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(userSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter = userSlice.actions[matchingActionName as keyof typeof userSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof UserState],
    }
  }
)

export default userSlice.reducer
