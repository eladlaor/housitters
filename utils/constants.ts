// rename all to be PascalCase

export const USER_TYPE = {
  landlord: 'landlord',
  Housitter: 'housitter',
  None: 'none',
}

export const HOUSITTERS_ROUTES = {
  HOME: '/housitters/Home',
  ACCOUNT: '/housitters/HousitterAccount',
}

export const LANDLORDS_ROUTES = {
  HOME: '/landlords/Home',
  ACCOUNT: '/landlords/landlordAccount',
}

export const SIGNUP_FORM_PROPS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  PASSWORD: 'password',
  VISIBLE: 'visible',
}

export const LocationIds = {
  Abroad: 'abroad',
  North: 'north',
  Haifa: 'haifa',
  PardesHana: 'pardesHana',
  Hasharon: 'hasharon',
  TelAviv: 'ta',
  NearTa: 'nearTa',
  Jerusalem: 'jerusalem',
  RishonToAshkelon: 'rishonToAshkelon',
  AshkelonToBash: 'ashkelonToBash',
  Eilat: 'eilat',
}

export const LocationDescriptions = {
  [LocationIds.Abroad]: 'outside Israel',
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
