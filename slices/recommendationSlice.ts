import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

// TODO: might be worth a rename, because this slice only refers to the recommendation form

export const initialState = {
  startMonth: new Date().toISOString(),
  duration: 0,
  sitIncluded: '',
  description: '',
  showRecommendationFormModal: false,
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
    setShowRecommendationFormModalState(state = initialState, action) {
      return {
        ...state,
        showRecommendationFormModal: action.payload,
      }
    },
  },
})

// Action creators (recommendationsSlice.action) are generated (automatically) for each case reducer function
export const {
  setStartMonthState,
  setDurationState,
  setDescriptionState,
  setSitIncludedState,
  setShowRecommendationFormModalState,
} = recommendationSlice.actions

export const selectStartMonthState = (state: RootState) => state.recommendation.startMonth
export const selectDurationState = (state: RootState) => state.recommendation.duration
export const selectSitIncludedState = (state: RootState) => state.recommendation.sitIncluded
export const selectDescriptionState = (state: RootState) => state.recommendation.description
export const selectShowRecommendationFormModalState = (state: RootState) =>
  state.recommendation.showRecommendationFormModal

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
