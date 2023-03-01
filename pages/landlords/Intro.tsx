import { useRouter } from 'next/router'

// TODO: i think change so you ask only where (one location), and what pets.
// availability will be set later.

// add an ANYWHERE option.

import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import {
  selectAvailabilityState,
  setPrimaryUse,
  setIsLoggedState,
  selectPrimaryUseState,
} from '../../slices/userSlice'
import { selectLocationState } from '../../slices/landlordSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import moment from 'moment'
import LocationSelector from '../../components/LocationSelector'
import { USER_TYPE, SIGNUP_FORM_PROPS } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Link from 'next/link'
import Modal from 'react-bootstrap/Modal'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'

export default function landlordIntro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()

  const [form, setForm] = useState({
    [SIGNUP_FORM_PROPS.FIRST_NAME]: '',
    [SIGNUP_FORM_PROPS.LAST_NAME]: '',
    [SIGNUP_FORM_PROPS.EMAIL]: '',
    [SIGNUP_FORM_PROPS.PASSWORD]: '',
    [SIGNUP_FORM_PROPS.VISIBLE]: true,
  } as any) // TODO: type it

  const [errors, setErrors] = useState({} as any)

  const availability = useSelector(selectAvailabilityState)
  const primaryUse = useSelector(selectPrimaryUseState)
  const location = useSelector(selectLocationState)

  // running just once ([]), to prevent the warning: updating a component while rendering a different one
  useEffect(() => {
    dispatch(setPrimaryUse(USER_TYPE.landlord))
  }, [])

  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  function setFormField(field: string, value: any) {
    setForm({
      ...form,
      [field]: value,
    })

    // setErrors({
    //   ...errors,
    //   [field]: null, // TODO: is this the best way
    // })
  }

  function setProfileVisibility(field: any, value: any) {
    setForm({
      ...form,
      visible: !form.visible,
    })

    // setErrors({
    //   ...errors,
    //   [field]: null, // TODO: is this the best way
    // })
  }

  async function handleSignUp(e: any) {
    e.preventDefault()
    setShow(false) // TODO: should probably add another kind of signifier to wait until registration completes, but twice alert is no good. maybe a route to a differnet page.

    let { data, error } = await supabaseClient.auth.signUp({
      email: form[SIGNUP_FORM_PROPS.EMAIL],
      password: form[SIGNUP_FORM_PROPS.PASSWORD],
      options: {
        // in supabase backend i defined a trigger: after a new user is added, a function is run, which upserts the following to the 'profiles' table
        data: {
          first_name: form[SIGNUP_FORM_PROPS.FIRST_NAME],
          last_name: form[SIGNUP_FORM_PROPS.LAST_NAME],
          visible: form[SIGNUP_FORM_PROPS.VISIBLE],
          primary_use: primaryUse,
          // locations: locationsDb, TODO: i need supabase assitacne to complete this one, as the jsonb object comes with invalid format.
        },
      },
    })

    if (error) {
      // TODO: for example, if a user is already registered
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

    console.log('data:', data)

    // TODO: if I'll be able to properly cast in the above call, the following won't be needed.
    if (data && data.user) {
      let userId = data.user.id

      const newlandlord = {
        user_id: userId,
        // TODO: this variable key names should be replaced with simple type safety
        // username: form.email.substring(0, form.email.indexOf('@')),
        // availability,
        location,
      }

      let { error } = await supabaseClient.from('landlords').upsert(newlandlord)
      if (error) {
        debugger
        console.log('the error object:', error)
        throw error
      } else {
        alert('success')
      }
    }

    dispatch(setIsLoggedState(true))
    router.push('Home')
  }

  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <p>ok lets find you a house</p>
      <div>
        <h1>WHEN are we talking about here?</h1>
        {availability.map((period, index) => (
          <AvailabilityPeriod key={index} period={period} index={index} />
        ))}
      </div>
      <div>
        <h1>Where do you live?</h1>
        <LocationSelector selectionType="radio" housitter={false} />
      </div>
      <div>
        <Button variant="primary" onClick={handleShow}>
          Find me a sitter
        </Button>
        <Modal show={show} onHide={handleClose} contentClassName="landlord-signup-modal">
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
                <Form.Control
                  type="password" // TODO: is this secure enough to get password like this?
                  placeholder="Password"
                  // value={form[SIGNUP_FORM_PROPS.PASSWORD]}
                  onChange={(e) => {
                    setFormField(SIGNUP_FORM_PROPS.PASSWORD, e.target.value)
                  }}
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
  )
}

/*

what does type 'submit' mean for a button

*/
