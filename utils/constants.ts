//TODO: rename all to be PascalCase

export const USER_TYPE = {
  Landlord: 'landlord',
  Housitter: 'housitter',
  None: 'none',
}

export const PageRoutes = {
  Intro: 'Intro',
  HousitterRoutes: {
    Home: '/housitters/Home',
    Intro: '/housitters/Intro',
    Account: '/housitters/HousitterAccount',
  },
  LandlordRoutes: {
    Home: '/landlords/Home',
    Intro: '/landlords/Intro',
    Account: '/landlords/LandlordAccount',
  },
}

/* Forms */
export const SIGNUP_FORM_PROPS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PASSWORD: 'password',
  VISIBLE: 'visible',
  GENDER: 'gender',
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

export const DbGenderTypes = {
  Male: 'male',
  Female: 'female',
  NonBinary: 'non-binary',
  Unknown: '',
}

/* api routes */

export const API_ROUTES = {
  SEND_EMAILS: '/api/send-emails',
}

/* */

export const TableNames = {
  ReviewsOnHousitters: 'reviews_on_housitters',
  ReviewsOnLandlords: 'reviews_on_landlords',
}

export const NavbarItems = [
  { href: 'about-housitting', text: 'About Housitting' },
  { href: 'about-us', text: 'About Us' },
  { href: 'faq', text: 'FAQ' },
  { href: 'contact-us', text: 'Contact Us' },
]

export enum SignOutElementTypes {
  Button = 'Button',
  Link = 'Link',
}
