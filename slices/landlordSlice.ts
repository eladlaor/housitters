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

export type landlordState = typeof initialState

export const landlordSlice = createSlice({
  name: 'landlord',
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

// Action creators (landlordSlice.action) are generated (automatically) for each case reducer function
export const { setLocationState, setPetsState } = landlordSlice.actions

export const selectLocationState = (state: RootState) => state.landlord.location
export const selectPetsState = (state: RootState) => state.landlord.pets
export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(landlordSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter = landlordSlice.actions[matchingActionName as keyof typeof landlordSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof landlordState],
    }
  }
)

export default landlordSlice.reducer
