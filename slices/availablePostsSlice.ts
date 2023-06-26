import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { DefaultAvailablePostType } from '../types/clientSide'
import { DefaultAvailablePost } from '../utils/constants'

// this is from the housitter perspective

export const initialState = [DefaultAvailablePost]

export type availablePostsState = typeof initialState
type DefaultAvailablePostKeys = keyof DefaultAvailablePostType

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
    // TODO: let's type it to make sure it works
    removePost(state = initialState, action) {
      return state.filter((post) => post.landlordId !== action.payload)
    },

    setLandlordFirstNameState(
      state = initialState,
      action: PayloadAction<{ landlordId: string; landlordFirstName: string }>
    ) {
      setSpecificLandlordPropertyByIndex(
        state,
        action.payload.landlordId,
        'landlordFirstName',
        action.payload.landlordFirstName
      )
    },

    setLandlordLastNameState(
      state = initialState,
      action: PayloadAction<{ landlordId: string; landlordLastName: string }>
    ) {
      setSpecificLandlordPropertyByIndex(
        state,
        action.payload.landlordId,
        'landlordLastName',
        action.payload.landlordLastName
      )
    },

    setLandlordAvatarUrlState(
      state,
      action: PayloadAction<{ landlordId: string; landlordAvatarUrl: string }>
    ) {
      setSpecificLandlordPropertyByIndex(
        state,
        action.payload.landlordId,
        'landlordAvatarUrl',
        action.payload.landlordAvatarUrl
      )
    },
  },
})

function getSpecificLandlordPropertyByIndex(
  state: RootState,
  landlordId: string,
  propertyName: keyof typeof DefaultAvailablePost,
  defaultValue: any
) {
  const index = state.availablePosts.findIndex(
    (post: { landlordId: string }) => post.landlordId === landlordId
  )

  if (index !== -1) {
    return state.availablePosts[index][propertyName]
  } else {
    return defaultValue
  }
}

function setSpecificLandlordPropertyByIndex<K extends DefaultAvailablePostKeys>(
  state: any,
  landlordId: string,
  propertyName: K,
  newValue: DefaultAvailablePostType[K]
) {
  const index = state.findIndex((post: { landlordId: string }) => post.landlordId === landlordId)

  if (index !== -1) {
    state[index][propertyName] = newValue
  }
}

// Action creators (postsSlice.action) are generated (automatically) for each case reducer function
export const {
  setAvailablePosts,
  setLandlordFirstNameState,
  setLandlordLastNameState,
  setLandlordAvatarUrlState,
  addPost,
  removePost,
} = availablePostsSlice.actions

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
