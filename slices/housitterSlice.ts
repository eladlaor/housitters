import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { LocationIds } from '../utils/constants'

export const initialState = {
  locations: [] as string[],
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
