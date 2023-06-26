import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Conversations } from '../types/clientSide'

export const initialState = {
  totalUnreadMessages: 0,
  conversations: {} as Conversations,
}

export type inboxState = typeof initialState

export const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setTotalUnreadMessagesState(state = initialState, action) {
      return {
        ...state,
        totalUnreadMessages: action.payload,
      }
    },
    setConversationsState(state = initialState, action) {
      return {
        ...state,
        conversations: action.payload,
      }
    },
  },
})

// Action creators (inboxSlice.action) are generated (automatically) for each case reducer function
export const { setTotalUnreadMessagesState, setConversationsState } = inboxSlice.actions

export const selectTotalUnreadMessagesState = (state: RootState) => state.inbox.totalUnreadMessages
export const selectConversationsState = (state: RootState) => state.inbox.conversations

export type SettersToInitialStates = {
  matchingSetter: any
  initialState: any
}[]

export const settersToInitialStates: SettersToInitialStates = Object.keys(initialState).map(
  (key) => {
    let matchingSetter
    const matchingActionName = Object.keys(inboxSlice.actions).find((actionName) => {
      return actionName.toLowerCase().includes(key.toLowerCase())
    })
    matchingSetter = inboxSlice.actions[matchingActionName as keyof typeof inboxSlice.actions]

    return {
      matchingSetter: matchingSetter,
      initialState: initialState[key as keyof inboxState],
    }
  }
)

export default inboxSlice.reducer
