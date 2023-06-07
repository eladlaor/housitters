import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { DbGenderTypes, USER_TYPE } from '../utils/constants'
import { Database } from '../types/supabase'

type Profiles = Database['public']['Tables']['profiles']['Row']

export const initialState = {
  isLogged: false,
  firstName: '',
  lastName: '',
  username: '',
  primaryUse: '',
  avatarUrl: '', // TODO: add some default image here
  birthday: new Date(0).toISOString(),
  gender: DbGenderTypes.Unknown as Profiles['gender'],
  availability: [
    {
      startDate: new Date().toISOString(),
      endDate: new Date(0).toISOString(),
    },
  ],
  usersContacted: [] as { userId: string; lastContacted: Date }[],
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
    setGenderState(state = initialState, action) {
      return {
        ...state,
        gender: action.payload,
      }
    },
    setAvailability(state = initialState, action) {
      return {
        ...state,
        availability: action.payload,
      }
    },
    setUsersContactedState(state = initialState, action) {
      return {
        ...state,
        usersContacted: action.payload,
      }
    },
  },
})

// Action creators (userSlice.action) are generated (automatically) for each case reducer function
export const {
  setIsLoggedState,
  setFirstName,
  setLastName,
  setUsername,
  setPrimaryUse,
  setAvatarUrl,
  setBirthday,
  setGenderState,
  setAvailability,
  setUsersContactedState,
} = userSlice.actions

export const selectIsLoggedState = (state: RootState) => state.user.isLogged
export const selectFirstNameState = (state: RootState) => state.user.firstName
export const selectLastNameState = (state: RootState) => state.user.lastName
export const selectUsernameState = (state: RootState) => state.user.username
export const selectPrimaryUseState = (state: RootState) => state.user.primaryUse
export const selectAvatarUrlState = (state: RootState) => state.user.avatarUrl
export const selectBirthdayState = (state: RootState) => state.user.birthday
export const selectGenderState = (state: RootState) => state.user.gender
export const selectAvailabilityState = (state: RootState) => state.user.availability
export const selectUsersContactedState = (state: RootState) => state.user.usersContacted

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
