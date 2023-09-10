import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

import { Database } from '../types/supabase'
import { DbGenderTypes, EditProfileProps, SIGNUP_FORM_PROPS, UserType } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectPrimaryUseState,
  setAvatarUrl,
  setFirstName,
  setLastName,
  setPrimaryUse,
  setUsername,
  setBirthday,
  setAvailability,
  setGenderState,
  setEmailState,
  selectFirstNameState,
  selectAvatarUrlState,
  selectEmailState,
  selectGenderState,
  selectLastNameState,
} from '../slices/userSlice'

import {
  selectExperienceState,
  selectLocationsState,
  setExperienceState,
} from '../slices/housitterSlice'
import { removeInvalidCharacters, resizeImage } from '../utils/files'
import { Container, Form, Row, Col, Spinner, Button } from 'react-bootstrap'
import PetsCounter from '../components/PetsCounter'
import CountAndUpdate from '../components/utils/CountAndUpdate'
import { getUrlFromSupabase, handleError } from '../utils/helpers'
import { selectPetsState } from '../slices/landlordSlice'

export default function Account() {
  const supabaseClient = useSupabaseClient<Database>()
  const user = useUser()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)
  const firstName = useSelector(selectFirstNameState)
  const lastName = useSelector(selectLastNameState)
  const gender = useSelector(selectGenderState)
  const email = useSelector(selectEmailState)
  const avatarUrl = useSelector(selectAvatarUrlState)
  const router = useRouter()
  const experience = useSelector(selectExperienceState)
  const [updatedAvatarPreviewUrl, setUpdatedAvatarPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const primary_use = useSelector(selectPrimaryUseState)
  const isHousitter = primary_use === UserType.Housitter
  const pets = useSelector(selectPetsState)

  const initialFormState: any = {
    firstName,
    lastName,
    email,
    gender,
  }

  const [form, setForm] = useState(initialFormState)

  function setFormField(field: string, value: any) {
    setForm((previousState: any) => {
      return {
        ...previousState,
        [field]: value,
      }
    })
  }

  useEffect(() => {
    if (!user) {
      return
    }

    getProfile()
  }, [user])

  async function getProfile() {
    try {
      setLoading(true)
      if (!user) {
        return
      } else {
        let { data, error, status } = await supabaseClient
          .from('profiles')
          .select(
            `username,
              first_name,
              last_name,
              primary_use,
              avatar_url,
              gender,
              email,
              birthday`
          )
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setFormField(EditProfileProps.FirstName, data.first_name)
          setFormField(EditProfileProps.LastName, data.last_name)
          setFormField(EditProfileProps.Gender, data.gender)
          setFormField(EditProfileProps.Email, data.email)
        }

        const availability = await getAvailabilityFromDb()
        dispatch(setAvailability(availability))
      }

      if (isHousitter) {
        const { error: housitterError, data: housitterData } = await supabaseClient
          .from('housitters')
          .select('about_me, experience')
          .eq('user_id', user.id)
          .single()

        if (housitterError) {
          return handleError(housitterError.message, 'getProfile')
        }

        if (housitterData) {
          setFormField(EditProfileProps.AboutMe, housitterData.about_me)
          dispatch(setExperienceState(housitterData.experience)) // with redux because it's being set in CountAndUpdate
        }
      }
    } catch (error) {
      console.log('Error loading user data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // TODO: a getter should not set
  async function getAvailabilityFromDb() {
    if (!user) {
      return
    }

    let { data: availableDates, error } = await supabaseClient
      .from('available_dates')
      .select('start_date, end_date')
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    if (availableDates && availableDates.length > 0) {
      const availableDatesAsReduxType = availableDates.map((date) => {
        return {
          startDate: date.start_date,
          endDate: date.end_date,
        }
      })

      return availableDatesAsReduxType
    }
  }

  async function handleSubmit() {
    if (!user) {
      alert(`user did not load yet, please try again`)
      return
    }

    let newAvatarUrl: string | boolean = false
    let newAvatar = (document.getElementById('avatarInput') as any).files[0]
    if (newAvatar) {
      const ext = newAvatar.name.split('.').pop()
      const filename = crypto.randomUUID() + '.' + ext
      const { data, error } = await supabaseClient.storage
        .from('avatars')
        .upload(filename, newAvatar)

      if (error) {
        return handleError(error.message, 'profile.handleSubmit')
      }

      if (data) {
        newAvatarUrl = filename
      }
    }

    const updatedProfile = {
      id: user.id,
      first_name: form.firstName,
      last_name: form.lastName,
      gender: form.gender,
      email: form.email,
      avatar_url: newAvatarUrl || avatarUrl,
    }

    const { error, data } = await supabaseClient.from('profiles').upsert(updatedProfile)
    if (error) {
      return handleError(error.message, 'profile.handleSubmit')
    }

    // this is done in order to make HomeNavbar re-render after changing the avatar, so the change would be reflected immediately
    dispatch(setAvatarUrl(newAvatarUrl))

    if (isHousitter) {
      let { error: housitterUpsertError } = await supabaseClient.from('housitters').upsert({
        user_id: user?.id,
        experience,
        about_me: form.aboutMe,
      })

      if (housitterUpsertError) {
        return handleError(housitterUpsertError.message, 'profile.handleSubmit')
      }
    } else {
      let { error: landlordUpsertError } = await supabaseClient.from('pets').upsert({
        user_id: user?.id,
        dogs: pets.dogs,
        cats: pets.cats,
      })

      if (landlordUpsertError) {
        return handleError(landlordUpsertError.message, 'profile.handleSubmit')
      }
    }

    alert(`profile updated successfuly`)
    router.push('/')
  }

  async function handleAvatarUpdate(event: any) {
    setIsUploading(true)
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      for (const file of event.target.files) {
        const fileName = removeInvalidCharacters(file.name)
        const resizedImage = await resizeImage(file, 1920, 1080)

        let { error: uploadError } = await supabaseClient.storage
          .from('avatars')
          .upload(`${user?.id}-${fileName}`, resizedImage, { upsert: true })

        if (uploadError) {
          return handleError(uploadError.message, 'handleAvatarUpdate')
        }

        setUpdatedAvatarPreviewUrl(fileName)
      }
    } catch (e: any) {
      console.log(`failed selecting new image for post: ${e}`)
      debugger
    }
    setIsUploading(false)
  }

  return (
    user && (
      <Container className="mt-4">
        <h1>Profile Editor</h1>
        <Form>
          <Row>
            <Col>
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
                  <Form.Text className="mb-2" muted></Form.Text>
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
                <Form.Label>About Me</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={5}
                  value={form.aboutMe}
                  onChange={(e) => setFormField(EditProfileProps.AboutMe, e.target.value)}
                ></Form.Control>
                <hr />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <h5>Current picture</h5>
                {isUploading ? (
                  <Spinner />
                ) : (
                  <img
                    src={
                      updatedAvatarPreviewUrl
                        ? getUrlFromSupabase(user?.id + '-' + updatedAvatarPreviewUrl, 'avatars')
                        : getUrlFromSupabase(avatarUrl, 'avatars')
                    }
                    style={{ width: '10rem', height: '10rem', borderRadius: '1000px' }}
                  />
                )}
                <h5>Update picture</h5>
                <input id="avatarInput" type="file" onChange={handleAvatarUpdate} />
              </Form.Group>
            </Col>
          </Row>

          <Button
            style={{ float: 'left' }}
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
      </Container>
    )
  )
}
