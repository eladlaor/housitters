import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { format, startOfMonth } from 'date-fns'

export const initialState = {
  startMonth: new Date().toISOString(),
  duration: 0,
  sitIncluded: '',
  description: '',
}

export type recommendationState = typeof initialState

export const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {
    setStartMonthState(state = initialState, action) {
      return {
        ...state,
        startMonth: action.payload,
      }
    },
    setDurationState(state = initialState, action) {
      return {
        ...state,
        duration: action.payload,
      }
    },
    setSitIncludedState(state = initialState, action) {
      return {
        ...state,
        sitIncluded: action.payload,
      }
    },
    setDescriptionState(state = initialState, action) {
      return {
        ...state,
        description: action.payload,
      }
    },
  },
})

// Action creators (recommendationsSlice.action) are generated (automatically) for each case reducer function
export const { setStartMonthState } = recommendationSlice.actions
export const { setDurationState } = recommendationSlice.actions
export const { setDescriptionState } = recommendationSlice.actions
export const { setSitIncludedState } = recommendationSlice.actions

export const selectStartMonthState = (state: RootState) => state.recommendation.startMonth
export const selectDurationState = (state: RootState) => state.recommendation.duration
export const selectSitIncludedState = (state: RootState) => state.recommendation.sitIncluded
export const selectDescriptionState = (state: RootState) => state.recommendation.description

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(recommendationSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter =
      recommendationSlice.actions[matchingActionName as keyof typeof recommendationSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof recommendationState],
    }
  }
)

export default recommendationSlice.reducer
