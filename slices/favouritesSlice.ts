import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { DefaultFavouriteUser } from '../utils/constants'

export const initialState = [DefaultFavouriteUser]

export type FavouritesState = typeof initialState

export const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    addFavouriteUser(state, action: PayloadAction<FavouritesState[0]>) {
      state.push(action.payload)
    },
    removeFavouriteUser(state, action: PayloadAction<string>) {
      return state.filter((favouriteUser) => favouriteUser.favouriteUserId !== action.payload)
    },
    setAllFavouriteUsers(state, action: PayloadAction<FavouritesState>) {
      return action.payload
    },
  },
})

// Action creators (favouritesSlice.action) are generated (automatically) for each case reducer function
export const { addFavouriteUser, removeFavouriteUser, setAllFavouriteUsers } =
  favouritesSlice.actions

export const selectAllFavouriteUsers = (state: RootState) => state.favourites

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(favouritesSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter =
      favouritesSlice.actions[matchingActionName as keyof typeof favouritesSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof FavouritesState],
    }
  }
)

export default favouritesSlice.reducer
