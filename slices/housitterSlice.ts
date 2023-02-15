import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { USER_TYPE, Locations } from '../utils/constants'

export const initialState = {
  locations: {
    north: false,
    haifa: false,
    pardesHana: false,
    hasharon: false,
    ta: false,
    nearTa: false,
    rishonToAshkelon: false,
    ashkelonToBeerSheva: false,
    beerSheva: false,
    eilat: false,
  },
  // locations: [] as Array<typeof Locations | undefined>, // how to define an array with either no values or enum values
}

export type HousitterState = typeof initialState

export const housitterSlice = createSlice({
  name: 'housitter',
  initialState,
  reducers: {
    setLocationsState(state = initialState, action) {
      return {
        ...state,
        locations: action.payload,
      }
    },
  },
})

// Action creators (housitterSlice.action) are generated (automatically) for each case reducer function
export const { setLocationsState } = housitterSlice.actions

export const selectLocationsState = (state: RootState) => state.housitter.locations
export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(housitterSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter =
      housitterSlice.actions[matchingActionName as keyof typeof housitterSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof HousitterState],
    }
  }
)

export default housitterSlice.reducer
