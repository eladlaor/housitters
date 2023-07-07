import { Button, Form } from 'react-bootstrap'
import Picture from '../Picture'
import { DbGenderTypes, PageRoutes, SIGNUP_FORM_PROPS, USER_TYPE } from '../../utils/constants'
import PetsCounter from '../PetsCounter'
import { useSelector } from 'react-redux'
import {
  selectAvatarUrlState,
  selectEmailState,
  selectFirstNameState,
  selectGenderState,
  selectLastNameState,
} from '../../slices/userSlice'
import { useState } from 'react'
import CountAndUpdate from '../utils/CountAndUpdate'
import { selectExperienceState, setExperienceState } from '../../slices/housitterSlice'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

export default function UserDetails({ isHousitter }: { isHousitter: boolean }) {
  const firstName = useSelector(selectFirstNameState)
  const lastName = useSelector(selectLastNameState)
  const gender = useSelector(selectGenderState)
  const user = useUser()
  const supabaseClient = useSupabaseClient()
  const email = useSelector(selectEmailState)
  const avatarUrl = useSelector(selectAvatarUrlState)
  const router = useRouter()

  async function handleSubmit() {
    if (!user) {
      alert(`user did not load yet, please try again`)
      return
    }

    const updatedProfile = {
      id: user.id,
      first_name: form.firstName,
      last_name: form.lastName,
      gender: form.gender,
      email: form.email,
      avatar_url: avatarUrl,
    }

    const { error, data } = await supabaseClient.from('profiles').upsert(updatedProfile)
    if (error) {
      alert(`failed upserting updated profile: ${error}`)
      debugger
      return
    }

    if (isHousitter) {
      // TODO: update housitters with more
    } else {
      // TODO: update landlords with more props
    }

    alert(`profile updated successfuly`)
    router.push(isHousitter ? PageRoutes.HousitterRoutes.Home : PageRoutes.LandlordRoutes.Home)
  }

  const experience = useSelector(selectExperienceState)

  const initialFormState: any = {
    firstName,
    lastName,
    email,
    gender,
  }

  const [form, setForm] = useState(initialFormState)

  // const [showPassword, setShowPassword] = useState(false)

  function setFormField(field: string, value: any) {
    setForm((previousState: any) => {
      return {
        ...previousState,
        [field]: value,
      }
    })
  }

  return (
    <Form className="d-flex flex-column align-items-center">
      <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.FIRST_NAME}>
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          placeholder=""
          value={form.firstName}
          onChange={(e) => {
            setFormField(SIGNUP_FORM_PROPS.FIRST_NAME, e.target.value)
          }}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.LAST_NAME}>
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          placeholder=""
          value={form.lastName}
          onChange={(e) => {
            setFormField(SIGNUP_FORM_PROPS.LAST_NAME, e.target.value)
          }}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.EMAIL}>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={(e) => {
            setFormField(SIGNUP_FORM_PROPS.EMAIL, e.target.value)
          }}
        />
      </Form.Group>
      {!isHousitter && (
        <Form.Group>
          <Form.Label>Pets</Form.Label>
          <PetsCounter />
          <hr />
        </Form.Group>
      )}
      {isHousitter && (
        <Form.Group>
          <Form.Label className="mb-2">Experience</Form.Label>
          <Form.Text className="mb-2" muted>
            {'   '} | approximately how many housits have you done
          </Form.Text>
          <CountAndUpdate valueToCount={experience} reduxReducer={setExperienceState} />
          <hr />
        </Form.Group>
      )}
      <Form.Group>
        <Form.Label>Gender</Form.Label>
        <Form.Select
          value={form.gender}
          onChange={(e) => setFormField(SIGNUP_FORM_PROPS.GENDER, e.target.value)}
        >
          <option value={DbGenderTypes.Male}>{DbGenderTypes.Male}</option>
          <option value={DbGenderTypes.Female}>{DbGenderTypes.Female}</option>
          <option value={DbGenderTypes.NonBinary}>{DbGenderTypes.NonBinary}</option>
          <option value={DbGenderTypes.Unknown}>{DbGenderTypes.Unknown}</option>
        </Form.Select>
        <hr />
      </Form.Group>

      <Form.Group>
        <Picture
          isIntro={true}
          uid=""
          primaryUse={USER_TYPE.Landlord}
          url={avatarUrl}
          size={100}
          width={100} // should persist dimensions of image upon upload
          height={100}
          disableUpload={false}
          bucketName="avatars"
          isAvatar={true}
          promptMessage="Profile Picture"
          email={form.email}
          isRounded={true}
        />
      </Form.Group>
      {/* {!isIntro && (
        <Form.Group>
          <Form.Label>Birthday</Form.Label>
          <Form.Control></Form.Control>
        </Form.Group>
      )} */}
      <Button
        variant="primary"
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        Submit
      </Button>
    </Form>
  )
}
