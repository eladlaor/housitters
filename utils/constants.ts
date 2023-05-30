//TODO: rename all to be PascalCase

export const USER_TYPE = {
  Landlord: 'landlord',
  Housitter: 'housitter',
  None: 'none',
}

export const HOUSITTERS_ROUTES = {
  HOME: '/housitters/Home',
  INTRO: '/housitters/Intro',
  ACCOUNT: '/housitters/HousitterAccount',
}

export const LANDLORDS_ROUTES = {
  HOME: '/landlords/Home',
  INTRO: '/landlords/Intro',
  ACCOUNT: '/landlords/LandlordAccount',
}

/* Forms */
export const SIGNUP_FORM_PROPS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PASSWORD: 'password',
  VISIBLE: 'visible',
}

export type SignupFormProps = typeof SIGNUP_FORM_PROPS

export interface SignupForm {
  firstName: string
  lastName: string
  email: string
  password: string
  visible: boolean
}

export interface EmailFormFields {
  title: string
  message: string
  reciepientEmail: string
}

export interface RecommendationProps {
  housitterId: string
  firstName: string
  lastName: string
  sitDuration: number
  startMonth: Date
  recommended_user_type: string
  recommended_by: string
  description: string
  showAllRecsModal: boolean
  setShowAllRecsModal: Function
}

/* Component Props / interfaces */

export interface RecommendationFormProps {
  housitterId: string
  firstName: string
  lastName: string
  recommendedUserType: string
  recommendedUserAvatarUrl: string
  showRecModal: boolean
  setShowRecModal: Function
}

export interface ClosedSit {
  housitterId: string
  housitterFirstName: string
  housitterLastName: string
  housitterAvatarUrl: string
  startDate: string
}

/* Location Selector */

export const LocationIds = {
  Abroad: 'abroad',
  North: 'north',
  Haifa: 'haifa',
  PardesHana: 'pardes_hana',
  Hasharon: 'hasharon',
  TelAviv: 'tel_aviv',
  NearTa: 'near_ta',
  Jerusalem: 'jerusalem',
  RishonToAshkelon: 'rishon_ashkelon',
  AshkelonToBash: 'ashkelon_bash',
  Eilat: 'eilat',
}

export const LocationDescriptions = {
  [LocationIds.Abroad]: 'Outside Israel',
  [LocationIds.North]: 'Northern than Haifa',
  [LocationIds.Haifa]: 'Haifa and around',
  [LocationIds.PardesHana]: 'Pardes-hana and around',
  [LocationIds.Hasharon]: 'Hasharon',
  [LocationIds.TelAviv]: 'Tel Aviv',
  [LocationIds.NearTa]: 'Near Tel Aviv',
  [LocationIds.Jerusalem]: 'Jerusalem',
  [LocationIds.RishonToAshkelon]: 'Between Rishon and Ashkelon',
  [LocationIds.AshkelonToBash]: 'Ashkelon to Bash',
  [LocationIds.Eilat]: 'Eilat',
}

/* api routes */

export const API_ROUTES = {
  SEND_EMAILS: '/api/send-emails',
}
