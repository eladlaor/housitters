import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { USER_TYPE, Locations } from '../utils/constants'

export const initialState = {
  location: '',
  pets: {
    dogs: 0,
    cats: 0,
    other: '',
  },
  // locations: [] as Array<typeof Locations | undefined>, // how to define an array with either no values or enum values
}

export type HouseOwnerState = typeof initialState

export const houseOwnerSlice = createSlice({
  name: 'houseOwner',
  initialState,
  reducers: {
    setLocation(state = initialState, action) {
      return {
        ...state,
        isLogged: action.payload,
      }
    },
    setPets(state = initialState, action) {
      return {
        ...state,
        firstName: action.payload,
      }
    },
  },
})

// Action creators (houseOwnerSlice.action) are generated (automatically) for each case reducer function
export const { setLocation, setPets } = houseOwnerSlice.actions

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
