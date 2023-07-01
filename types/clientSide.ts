import { MouseEventHandler } from 'react'
import { DefaultAvailablePost, SIGNUP_FORM_PROPS, SignOutElementTypes } from '../utils/constants'

export type HousitterProps = {
  housitterId: string
  firstName: string
  lastName: string
  experience?: number | null
  age?: number
  about_me?: string
  avatarUrl: string | null
}

/* Redux types */

/* post slice */
export type ImageData = {
  url: string
  id: number
}

/* Selected User Recommendations */
export type SelectedUserReview = {
  reviewerFirstName: string
  reviewerLastName: string
  reviewerUserId: string
  reviewerAvatarUrl: string
  description: string
  startMonth: string
  duration: number
  sitIncluded: string
  selectedUserFirstName: string
  selectedUserLastName: string
}

/* COMPONENT PROPS */

export interface ReviewsOnSelectedUserProps {
  selectedUserId: string
  selectedUserFirstName: string
  selectedUserLastName: string
  selectedUserType: string
}

export interface HousePreviewProps {
  landlordId: string
  title: string
  description: string
  location: string
  availability: { startDate: string; endDate: string }[]
  dogs: number
  cats: number
  imagesUrls: ImageData[]
  addMissingDetailsHandler: MouseEventHandler<HTMLButtonElement> | null
}

export interface MessageSenderProps {
  recipientFirstName: string
  recipientLastName: string
  recipientUserId: string
  senderFirstName: string
  senderLastName: string
  isChat: boolean
}

export type SignupFormProps = typeof SIGNUP_FORM_PROPS

export interface SignupForm {
  firstName: string
  lastName: string
  email: string
  password: string
  avatarUrl: string
  gender: string
}

export interface RecommendationFormProps {
  reviewedUserId: string
  reviewedUserFirstName: string
  reviewedUserLastName: string
  reviewedUserType: string
}

export interface ClosedSit {
  housitterId: string
  housitterFirstName: string
  housitterLastName: string
  housitterAvatarUrl: string
  startDate: string
}

export interface NavbarItem {
  href: string
  text: string
}

export interface SignOutProps {
  elementType: SignOutElementTypes
}

export interface HomeNavbarProps {}

export interface DbAvailableHousitter {
  firstName: string
  lastName: string
  housitterId: string
  avatarUrl: string
  locations: string[]
  availability: { startDate: Date; endDate: Date }[]
  experience: number
  about_me: string
}

export type DefaultAvailablePostType = {
  landlordId: string
  landlordAvatarUrl: string
  landlordFirstName: string
  landlordLastName: string
  title: string
  description: string
  location: string
  dogs: number
  cats: number
  imagesUrls: ImageData[]
}

export interface Conversation {
  recipientFirstName: string
  recipientLastName: string
  recipientAvatarUrl: string
  latestMessage: { messageContent: string; sentAt: string } | null
  pastMessages:
    | [
        {
          messageContent: string
          isSender: boolean
          isReadByRecipient: boolean
          sentAt: string
          id: number
        }
      ]
    | null
  unreadMessages: 0
}

export interface Conversations {
  [key: string]: Conversation
}
