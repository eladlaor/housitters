//TODO: i should rename all to be PascalCase
import { ImageData } from '../types/clientSide'

export const UserType = {
  Landlord: 'landlord',
  Housitter: 'housitter',
  None: 'none',
}

export const PageRoutes = {
  Profile: '/profile',
  Intro: '/intro',
  HousitterRoutes: {
    Home: '/houses',
    EditHouse: '/houses/edit',
    Account: '/housitters/housitter-account',
  },
  LandlordRoutes: {
    Home: '/housitters',
  },
  Auth: {
    Login: '/auth/login',
    RenewPassword: '/auth/renew-password',
    ForgotMyPassword: '/auth/forgot-my-password',
    Signup: '/auth/signup',
  },
}

export const RedirectUrls = {
  Index: 'https://www.housitters.com/',
  RenewPassword: `https://www.housitters.com${PageRoutes.Auth.RenewPassword}`,
}

/* Forms */
export const SIGNUP_FORM_PROPS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  USER_TYPE: 'userType',
  PASSWORD: 'password',
  VISIBLE: 'visible',
  GENDER: 'gender',
}

export const EditProfileProps = {
  FirstName: 'firstName',
  LastName: 'lastName',
  Email: 'email',
  Dogs: 'dogs',
  Cats: 'cats',
  Gender: 'gender',
  AboutMe: 'aboutMe',
  Experience: 'experience',
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

export const LocationSelectionEventKeys = {
  Anywhere: 'Anywhere',
  CustomLocations: 'Select areas',
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
  NavDropdownItem = 'NavDropdownItem',
  Link = 'Link',
}

export const DefaultAvailabilityPeriod = {
  StartDate: new Date().toISOString(),
  EndDate: new Date(0).toISOString(),
}

export const DefaultAvailabilityState = [DefaultAvailabilityPeriod]

export const DefaultAvailablePost = {
  landlordId: '',
  landlordAvatarUrl: '',
  landlordFirstName: '',
  landlordLastName: '',
  title: '',
  description: '',
  location: '',
  dogs: 0,
  cats: 0,
  imagesUrls: [
    {
      url: '',
      id: 0,
    },
  ] as ImageData[],
}

export const DefaultFavouriteUser = {
  favouriteUserType: '',
  favouriteUserId: '',
  markedByUserId: '',
}

export const SwrUniqueCachingKeys = {
  Favourites: 'Favourites',
}

export const SortingProperties = {
  HousitterDashboard: {
    PetsQuantity: 'number of pets',
    Duration: 'duration',
    Reviews: 'number of reviews',
  },
  LandlordDashboard: {
    FirstName: 'first name',
    Experience: 'experience',
    Reviews: 'number of reviews',
  },
}

export const SortingPropertiesForHandler = {
  [SortingProperties.LandlordDashboard.FirstName]: 'firstName',
  [SortingProperties.LandlordDashboard.Experience]: 'experience',
}

export const SignupErrorMessages = {
  ExistingEmail: 'already registered',
  MissingFields: 'Incomplete Form',
}

export const SignupErrorFeedbacks = {
  ExistingEmail: 'This email is already registered',
}

export const MandatorySignupFields = {
  firstName: 'First Name',
  lastName: 'Last Name',
  avatarUrl: 'Profile Picture',
  email: 'Email',
  password: 'Password',
  gender: 'Gender',
}
