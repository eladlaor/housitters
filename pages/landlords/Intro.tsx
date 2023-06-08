import { useRouter } from 'next/router'

// TODO: i think change so you ask only where (one location), and what pets. // debugger

import AvailabilitySelector from '../../components/AvailabilitySelector'
import {
  selectAvailabilityState,
  setPrimaryUse,
  setIsLoggedState,
  selectPrimaryUseState,
  setAvailability,
  selectAvatarUrlState,
} from '../../slices/userSlice'
import { selectLocationState, selectPetsState } from '../../slices/landlordSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import LocationSelector from '../../components/LocationSelector'
import { USER_TYPE, SIGNUP_FORM_PROPS, SignupForm, DbGenderTypes } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'
import PetsCounter from '../../components/PetsCounter'

import Picture from '../../components/Picture'

export default function landlordIntro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()

  const initialFormState: SignupForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    visible: true,
    gender: '',
  }

  const [form, setForm] = useState(initialFormState)

  const avatarUrl = useSelector(selectAvatarUrlState)

  const availability = useSelector(selectAvailabilityState)
  const primaryUse = useSelector(selectPrimaryUseState)
  const location = useSelector(selectLocationState)
  const pets = useSelector(selectPetsState)

  dispatch(setPrimaryUse(USER_TYPE.Landlord))

  // running just once ([]), to prevent the warning: updating a component while rendering a different one
  useEffect(() => {}, [])

  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  function setFormField(field: string, value: any) {
    setForm((previousState) => {
      return {
        ...previousState,
        [field]: value,
      }
    })
  }

  async function handleSignUp(e: any) {
    e.preventDefault()
    setShowModal(false) // TODO: should probably add another kind of signifier to wait until registration completes, but twice alert is no good. maybe a route to a differnet page.

    let { data, error } = await supabaseClient.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      // TODO: for example, if a user is already registered, or if db error

      debugger
      switch (error.message) {
        case 'user already registered':
          alert(
            'this email is already registered. a password recovery mechanism will be implemented soon'
          )
          break
        default:
          alert(error.message)
      }
      throw error
    }

    // TODO: no need for this users view thing, just add email to profiles...
    // visible and editable via supabase ui. creates a view containing only the 'email' field of the restricted auth.users table
    // this is required in order to allow users to send each other emails.
    // const { error: rpcError } = await supabaseClient.rpc('update_users_view')
    // if (rpcError) {
    //   alert(`rpc error`)
    //   debugger
    //   throw rpcError
    // }

    if (data && data.user) {
      let userId = data.user.id

      const newProfile = {
        id: userId,
        username: form.email.substring(0, form.email.indexOf('@')),
        first_name: form.firstName,
        last_name: form.lastName,
        primary_use: primaryUse,
        avatar_url: avatarUrl,
        visible: form.visible,
        email: form.email,
        gender: form.gender,
      }

      let { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({ ...newProfile, updated_at: new Date() })
      if (profileError) {
        alert(`Error when upserting new landlord to \'profiles\' table: ${profileError}`)
        throw profileError
      }

      const newlandlord = {
        user_id: userId,
        location,
      }

      let { error: landlordError } = await supabaseClient.from('landlords').upsert(newlandlord)
      if (landlordError) {
        alert(`Error when upserting new landlord to \'landlords\' table: ${landlordError}`)
        throw landlordError
      }

      availability.forEach(async (period) => {
        let { error: availabilityError } = await supabaseClient.from('available_dates').upsert({
          user_id: userId,
          start_date: period.startDate,
          end_date: period.endDate,
          user_type: USER_TYPE.Landlord,
        })
        if (availabilityError) {
          alert(`failed upserting landlord to available_dates table: ${error}`)
          throw error
        }
      })

      dispatch(setAvailability(availability))

      const newPets = {
        user_id: userId,
        dogs: pets.dogs,
        cats: pets.cats,
      }

      let { error: petsError } = await supabaseClient.from('pets').upsert(newPets)
      if (petsError) {
        alert(`error uploading pets: ${petsError}`)
        throw petsError
      }
    }

    dispatch(setIsLoggedState(true))
    const homeProps = {
      isAfterSignup: true,
    }

    alert(`Successfully created new landlord: ${form.firstName} ${form.lastName}`)
    router.push({ pathname: 'Home', query: homeProps })
  }

  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <h1>ok lets find you a sitter</h1>
      <div>
        <h1>When?</h1>
        {availability.map((period, index) => (
          <AvailabilitySelector
            key={index}
            period={period}
            index={index}
            updateDbInstantly={false}
          />
        ))}
      </div>
      <div>
        <h1>Where do you live?</h1>
        <LocationSelector
          selectionType="radio"
          isHousitter={false}
          showCustomLocations={true}
          updateDbInstantly={false}
        />
      </div>
      <div>
        <Button variant="primary" onClick={handleShow}>
          Find me a sitter
        </Button>
        <Modal show={showModal} onHide={handleClose} contentClassName="landlord-signup-modal">
          <Modal.Header closeButton>
            <Modal.Title style={{ color: 'blue' }}>One more step</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.FIRST_NAME}>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder=""
                  value={form.firstName as string}
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
              <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.PASSWORD}>
                <Form.Label>Password</Form.Label>
                <div className="password-input-wrapper">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'} // TODO: is this secure enough to get password like this?
                    placeholder="Password"
                    // value={form[SIGNUP_FORM_PROPS.PASSWORD]}
                    onChange={(e) => {
                      setFormField(SIGNUP_FORM_PROPS.PASSWORD, e.target.value)
                    }}
                  />
                  <Button
                    variant="info"
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                  <hr />
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Pets</Form.Label>
                <PetsCounter />
              </Form.Group>
              <Form.Group>
                <Form.Select
                  value={form.gender}
                  onChange={(e) => setFormField(SIGNUP_FORM_PROPS.GENDER, e.target.value)}
                >
                  <option value={DbGenderTypes.Male}>{DbGenderTypes.Male}</option>
                  <option value={DbGenderTypes.Female}>{DbGenderTypes.Female}</option>
                  <option value={DbGenderTypes.NonBinary}>{DbGenderTypes.NonBinary}</option>
                  <option value={DbGenderTypes.Unknown}>{DbGenderTypes.Unknown}</option>
                </Form.Select>
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
                  promptMessage="Choose a profile picture"
                  email={form.email}
                />
              </Form.Group>

              <Button variant="primary" type="submit" onClick={handleSignUp}>
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  )
}

/*

what does type 'submit' mean for a button

*/
