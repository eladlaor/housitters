import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { USER_TYPE, LocationIds } from '../utils/constants'

export const initialState = {
  location: '',
  pets: {
    dogs: 0,
    cats: 0,
    other: '',
  },
}

export type HouseOwnerState = typeof initialState

export const houseOwnerSlice = createSlice({
  name: 'houseOwner',
  initialState,
  reducers: {
    setLocationState(state = initialState, action) {
      return {
        ...state,
        location: action.payload,
      }
    },
    setPetsState(state = initialState, action) {
      return {
        ...state,
        pets: action.payload,
      }
    },
  },
})

// Action creators (houseOwnerSlice.action) are generated (automatically) for each case reducer function
export const { setLocationState, setPetsState } = houseOwnerSlice.actions

export const selectLocationState = (state: RootState) => state.houseOwner.location
export const selectPetsState = (state: RootState) => state.houseOwner.pets
export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(houseOwnerSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter =
      houseOwnerSlice.actions[matchingActionName as keyof typeof houseOwnerSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof HouseOwnerState],
    }
  }
)

export default houseOwnerSlice.reducer
