import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

export const initialState = {
  imagesUrls: [] as Array<string>,
  imagesFiles: [] as Array<any>, // TODO: how to type a file?
}

export type postState = typeof initialState

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setImagesUrlsState(state = initialState, action) {
      return {
        ...state,
        imagesUrls: action.payload,
      }
    },
  },
})

// Action creators (postsSlice.action) are generated (automatically) for each case reducer function
export const { setImagesUrlsState } = postSlice.actions

export const selectImagesUrlsState = (state: RootState) => state.post.imagesUrls

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
