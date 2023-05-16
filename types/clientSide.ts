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
