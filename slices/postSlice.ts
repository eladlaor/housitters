import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { ImageData } from '../types/clientSide'

export const initialState = {
  imagesData: [] as ImageData[],
  isActive: false,
  description: '',
  title: '',
}

export type postState = typeof initialState

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setImagesDataState(state = initialState, action) {
      return {
        ...state,
        imagesData: action.payload,
      }
    },
    setIsActiveState(state = initialState, action) {
      return {
        ...state,
        isActive: action.payload,
      }
    },
    setDescriptionState(state = initialState, action) {
      return {
        ...state,
        description: action.payload,
      }
    },
    setTitleState(state = initialState, action) {
      return {
        ...state,
        title: action.payload,
      }
    },
  },
})

// Action creators (postsSlice.action) are generated (automatically) for each case reducer function
export const { setImagesDataState } = postSlice.actions
export const { setIsActiveState } = postSlice.actions
export const { setDescriptionState } = postSlice.actions
export const { setTitleState } = postSlice.actions

export const selectImagesDataState = (state: RootState) => state.post.imagesData
export const selectIsActiveState = (state: RootState) => state.post.isActive
export const selectDescriptionState = (state: RootState) => state.post.description
export const selectTitleState = (state: RootState) => state.post.title

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(postSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter = postSlice.actions[matchingActionName as keyof typeof postSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof postState],
    }
  }
)

export default postSlice.reducer
