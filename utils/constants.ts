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
    Account: '/housitters/housitter-account',
  },
  LandlordRoutes: {
    Home: '/housitters',
    EditHouse: '/houses/edit',
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
  Center: 'center',
  Jerusalem: 'jerusalem',
  South: 'south',
}

export const LocationDescriptions = {
  [LocationIds.Abroad]: 'Outside Israel',
  [LocationIds.North]: 'North Israel',
  [LocationIds.Center]: 'Central Israel',
  [LocationIds.Jerusalem]: 'Jerusalem',
  [LocationIds.South]: 'South Israel',
}

export const LocationSelectionEventKeys = {
  Anywhere: 'Anywhere',
  CustomLocations: 'Select Areas',
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

export const NoDescriptionDefaultMessage = `a description hasn't been written yet`

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
    Duration: 'duration',
    PetsQuantity: 'number of pets',
  },
  LandlordDashboard: {
    Experience: 'experience',
    Gender: 'gender',
  },
}

export const SortingPropertiesForHandler = {
  [SortingProperties.LandlordDashboard.Gender]: 'gender',
  [SortingProperties.LandlordDashboard.Experience]: 'experience',
  [SortingProperties.HousitterDashboard.Duration]: 'duration',
  [SortingProperties.HousitterDashboard.PetsQuantity]: 'number of pets',
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
