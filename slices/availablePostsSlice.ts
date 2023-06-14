import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { ImageData } from '../types/clientSide'
import { DefaultAvailablePost } from '../utils/constants'

// this is from the housitter perspective

export const initialState = [DefaultAvailablePost]

export type availablePostsState = typeof initialState

export const availablePostsSlice = createSlice({
  name: 'availablePosts',
  initialState,
  reducers: {
    // TODO: no need for initialState as it is handled by redux toolkit
    setAvailablePosts(state, action: PayloadAction<availablePostsState>) {
      return action.payload
    },
    addPost(state, action: PayloadAction<availablePostsState[0]>) {
      state.push(action.payload)
    },
    removePost(state = initialState, action) {
      return state.filter((post) => post.landlordId !== action.payload)
    },
    setLandlordAvatarUrlState(
      state,
      action: PayloadAction<{ landlordId: string; landlordAvatarUrl: string }>
    ) {
      const index = state.findIndex((post) => post.landlordId === action.payload.landlordId)
      if (index !== -1) {
        state[index].landlordAvatarUrl = action.payload.landlordAvatarUrl
      }
    },
    setImagesUrlsState(state = initialState, action) {
      return {
        ...state,
        imagesUrls: action.payload,
      }
    },
    setDescriptionState(
      state = initialState,
      action: PayloadAction<{ landlordId: string; description: string }>
    ) {
      const index = state.findIndex((post) => post.landlordId === action.payload.landlordId)

      // TODO: with redux toolkit, it's possible to change in place, as it uses a lib under the hood (immer) which creates the new thing
      if (index !== -1) {
        state[index].description = action.payload.description
      }
    },

    // TODO: should make the changes here as well

    setTitleState(state = initialState, action) {
      return {
        ...state,
        title: action.payload,
      }
    },
    setDogsState(state = initialState, action) {
      return {
        ...state,
        dogs: action.payload,
      }
    },
    setCatsState(state = initialState, action) {
      return {
        ...state,
        cats: action.payload,
      }
    },
    setLocationState(state = initialState, action) {
      return {
        ...state,
        location: action.payload,
      }
    },
  },
})

// Action creators (postsSlice.action) are generated (automatically) for each case reducer function
export const {
  setAvailablePosts,
  setLandlordAvatarUrlState,
  addPost,
  setImagesUrlsState,
  setDescriptionState,
  setTitleState,
  setLocationState,
  setDogsState,
  setCatsState,
} = availablePostsSlice.actions

function getSpecificLandlordPropertyByIndex(
  state: RootState,
  landlordId: string,
  propertyName: keyof typeof DefaultAvailablePost,
  defaultValue: any
) {
  const index = state.availablePosts.findIndex((post) => post.landlordId === landlordId)

  if (index !== -1) {
    return state.availablePosts[index][propertyName]
  } else {
    return defaultValue
  }
}

export const selectAvailablePostsState = (state: RootState) => state.availablePosts
export const selectImagesUrlsState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(
    state,
    landlordId,
    'imagesUrls',
    DefaultAvailablePost.imagesUrls
  )

export const selectDescriptionState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(
    state,
    landlordId,
    'description',
    DefaultAvailablePost.description
  )

export const selectLandlordAvatarUrlState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(
    state,
    landlordId,
    'landlordAvatarUrl',
    DefaultAvailablePost.landlordAvatarUrl
  )

export const selectLandlordFirstNameState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(
    state,
    landlordId,
    'landlordFirstName',
    DefaultAvailablePost.landlordFirstName
  )

export const selectLandlordLastNameState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(
    state,
    landlordId,
    'landlordLastName',
    DefaultAvailablePost.landlordLastName
  )

export const selectTitleState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(state, landlordId, 'title', DefaultAvailablePost.title)

export const selectDogsState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(state, landlordId, 'dogs', DefaultAvailablePost.dogs)

export const selectCatsState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(state, landlordId, 'cats', DefaultAvailablePost.cats)

export const selectLocationState = (state: RootState, landlordId: string) =>
  getSpecificLandlordPropertyByIndex(state, landlordId, 'location', DefaultAvailablePost.location)

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(availablePostsSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter =
      availablePostsSlice.actions[matchingActionName as keyof typeof availablePostsSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof availablePostsState],
    }
  }
)

export default availablePostsSlice.reducer
