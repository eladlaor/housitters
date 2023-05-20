import { useRouter } from 'next/router'

import AvailabilitySelector from '../../components/AvailabilitySelector'
import {
  selectAvailabilityState,
  setPrimaryUse,
  setIsLoggedState,
  selectPrimaryUseState,
  setFirstName,
  setAvatarUrl,
  selectAvatarUrlState,
} from '../../slices/userSlice'

import { selectLocationsState } from '../../slices/housitterSlice'

import { useDispatch, useSelector } from 'react-redux'

import LocationSelector from '../../components/LocationSelector'
import { USER_TYPE, SIGNUP_FORM_PROPS, LocationIds } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'
import { ImageData } from '../../types/clientSide'

import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import PictureBetter from '../../components/PictureBetter'

export default function HousitterIntro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()

  const [form, setForm] = useState({
    [SIGNUP_FORM_PROPS.FIRST_NAME]: '',
    [SIGNUP_FORM_PROPS.LAST_NAME]: '',
    [SIGNUP_FORM_PROPS.EMAIL]: '',
    [SIGNUP_FORM_PROPS.PASSWORD]: '',
    [SIGNUP_FORM_PROPS.VISIBLE]: true,
  } as any) // TODO: type it (try better than string | boolean which is not good)

  const [errors, setErrors] = useState({} as any)

  const availability = useSelector(selectAvailabilityState)
  const primaryUse = useSelector(selectPrimaryUseState)
  const locations = useSelector(selectLocationsState)
  const [previewDataUrls, setPreviewDataUrls] = useState([] as ImageData[])
  const [fileNames, setFileNames] = useState([] as ImageData[])
  const avatarUrl = useSelector(selectAvatarUrlState)

  dispatch(setPrimaryUse(USER_TYPE.Housitter))

  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  function setFormField(field: any, value: any) {
    setForm({
      ...form,
      [field]: value,
    })
  }

  function setProfileVisibility(field: any, value: any) {
    setForm({
      ...form,
      visible: !form.visible,
    })
  }

  async function handleSignUp(e: any) {
    e.preventDefault()
    setShowModal(false)

    let { data, error } = await supabaseClient.auth.signUp({
      email: form[SIGNUP_FORM_PROPS.EMAIL],
      password: form[SIGNUP_FORM_PROPS.PASSWORD],
    })

    if (error) {
      alert(`Sign up failed with the following error: ${error}`)
      throw error
    }

    // TODO: if I'll be able to properly send to multiple tables (with correctly parsing the types i send), the following won't be needed.
    if (data && data.user) {
      const userId = data.user.id

      // TODO: should update the above to do it without stored procedure, all here
      const newProfile = {
        id: userId,
        first_name: form[SIGNUP_FORM_PROPS.FIRST_NAME],
        last_name: form[SIGNUP_FORM_PROPS.LAST_NAME],
        username: form.email.substring(0, form.email.indexOf('@')),
        visible: form[SIGNUP_FORM_PROPS.VISIBLE],
        primary_use: primaryUse,
        avatar_url: avatarUrl,
      }

      let { error: profileUpsertError } = await supabaseClient
        .from('profiles')
        .upsert({ ...newProfile, updated_at: new Date() })
      if (profileUpsertError) {
        alert(`error upserting profile: ${profileUpsertError}`)
        throw profileUpsertError
      }

      dispatch(setAvatarUrl(newProfile.avatar_url))

      // TODO: this variable key names should be replaced with simple type safety
      const newHousitter = {
        user_id: userId,
        locations,
      }

      let { error } = await supabaseClient.from('housitters').upsert(newHousitter)
      if (error) {
        alert(`failed upserting housitter to housitters table: ${error}`)
        throw error
      }

      availability.forEach(async (period) => {
        let { error: availabilityError } = await supabaseClient.from('available_dates').upsert({
          user_id: userId,
          start_date: period.startDate,
          end_date: period.endDate,
          user_type: USER_TYPE.Housitter,
        })
        if (availabilityError) {
          alert(`failed upserting housitter to available_dates table: ${error}`)
          debugger
          throw error
        }
      })
    }

    dispatch(setIsLoggedState(true))
    alert('success')
    router.push('Home')
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#">Housitters</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div>
            <p className="headline">Let's find you a house!</p>
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
              <h1>Where?</h1>
              <LocationSelector
                selectionType="checkbox"
                isHousitter={true}
                showCustomLocations={locations.length < Object.values(LocationIds).length}
                updateDbInstantly={false}
              />
            </div>
            <div>
              <Button variant="primary" onClick={handleShow}>
                Find me a house
              </Button>
              <Modal show={showModal} onHide={handleClose} contentClassName="my-modal">
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
                        value={form[SIGNUP_FORM_PROPS.FIRST_NAME]}
                        onChange={(e) => {
                          setFormField(SIGNUP_FORM_PROPS.FIRST_NAME, e.target.value)
                          dispatch(setFirstName(e.target.value))
                        }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.LAST_NAME}>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder=""
                        value={form[SIGNUP_FORM_PROPS.LAST_NAME]}
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
                        value={form[SIGNUP_FORM_PROPS.EMAIL]}
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
                      <PictureBetter
                        isIntro={true}
                        uid=""
                        primaryUse={USER_TYPE.Housitter}
                        url={avatarUrl}
                        size={100}
                        width={100} // should persist dimensions of image upon upload
                        height={100}
                        disableUpload={false}
                        bucketName="avatars"
                        isAvatar={true}
                        promptMessage="Choose a profile picture"
                        email={form[SIGNUP_FORM_PROPS.EMAIL]}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId={SIGNUP_FORM_PROPS.VISIBLE}>
                      <h2 style={{ color: 'blue' }}>which type of user are you</h2>
                      <Form.Text className="text-muted">
                        an anonymous profile can approach other visible or anonymous profiles.
                      </Form.Text>
                      <Form.Check
                        type="checkbox"
                        label="anonymous"
                        id="anonymous"
                        value={form[SIGNUP_FORM_PROPS.VISIBLE]}
                        onChange={(e) => {
                          setProfileVisibility(SIGNUP_FORM_PROPS.VISIBLE, e.target.id)
                        }}
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

/*

what does type 'submit' mean for a button

*/
