import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

export const initialState = {
  location: '',
  pets: {
    dogs: 0,
    cats: 0,
    other: '',
  },
  sittersContacted: [] as { housitterId: string; lastContacted: Date }[],
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
    setSittersContactedState(state = initialState, action) {
      return {
        ...state,
        sittersContacted: action.payload,
      }
    },
  },
})

// Action creators (landlordSlice.action) are generated (automatically) for each case reducer function
export const { setLocationState, setPetsState, setSittersContactedState } = landlordSlice.actions

export const selectLocationState = (state: RootState) => state.landlord.location
export const selectPetsState = (state: RootState) => state.landlord.pets
export const selectSittersContactedState = (state: RootState) => state.landlord.sittersContacted
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
