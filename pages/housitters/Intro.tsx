import { useRouter } from 'next/router'

import AvailabilityPeriod from '../../components/AvailabilityPeriod'
import {
  selectAvailabilityState,
  setPrimaryUse,
  setIsLoggedState,
  selectPrimaryUseState,
  selectFirstNameState,
  setFirstName,
} from '../../slices/userSlice'

import { selectLocationsState } from '../../slices/housitterSlice'

import { useDispatch, useSelector } from 'react-redux'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import moment from 'moment'
import LocationSelector from '../../components/LocationSelector'
import { USER_TYPE, SIGNUP_FORM_PROPS } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Form from 'react-bootstrap/Form'
import { useState } from 'react'

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'

export default function HousitterIntro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()
  const firstName = useSelector(selectFirstNameState)

  const [form, setForm] = useState({
    [SIGNUP_FORM_PROPS.FIRST_NAME]: '',
    [SIGNUP_FORM_PROPS.LAST_NAME]: '',
    [SIGNUP_FORM_PROPS.EMAIL]: '',
    [SIGNUP_FORM_PROPS.PASSWORD]: '',
    [SIGNUP_FORM_PROPS.VISIBLE]: true,
  } as any) // TODO: type it

  const [errors, setErrors] = useState({} as any)

  // debugger
  const availability = useSelector(selectAvailabilityState)
  const primaryUse = useSelector(selectPrimaryUseState)
  const locations = useSelector(selectLocationsState)

  dispatch(setPrimaryUse(USER_TYPE.Housitter))

  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  function setFormField(field: any, value: any) {
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
    setShow(false)

    let { data, error } = await supabaseClient.auth.signUp({
      email: form[SIGNUP_FORM_PROPS.EMAIL],
      password: form[SIGNUP_FORM_PROPS.PASSWORD],
      options: {
        data: {
          // in a postgres stored procedure (in supabase backend) named 'handle_new_user', with a trigger defined there as well.
          // https://app.supabase.com/project/rssznetfvuqctnxfwvzr/database/functions
          first_name: form[SIGNUP_FORM_PROPS.FIRST_NAME],
          last_name: form[SIGNUP_FORM_PROPS.LAST_NAME],
          username: form.email.substring(0, form.email.indexOf('@')),
          visible: form[SIGNUP_FORM_PROPS.VISIBLE],
          primary_use: primaryUse,
          // there is a problem with getting array values (jsonb) in these functions, which causes a problem getting all values in here
        },
      },
    })

    if (error) {
      throw error
    }

    // TODO: if I'll be able to properly send to multiple tables (with correctly parsing the types i send), the following won't be needed.
    if (data && data.user) {
      let userId = data.user.id

      // TODO: this variable key names should be replaced with simple type safety

      const newHousitter = {
        user_id: userId,
        locations,
        availability,
      }

      let { error } = await supabaseClient.from('housitters').upsert(newHousitter)
      if (error) {
        console.log('the error object:', error)
        throw error
      } else {
        alert('success')
      }
    }

    dispatch(setIsLoggedState(true))
    router.push('Home')
  }

  // debugger
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <div>
          <p>ok lets find you a house</p>
          <div>
            <h1>WHEN are we talking about here?</h1>
            {availability.map((period, index) => (
              <AvailabilityPeriod key={index} period={period} index={index} />
            ))}
          </div>
          <div>
            <h1>Where?</h1>
            <LocationSelector selectionType="checkbox" housitter={true} />
          </div>
          <div>
            <Button variant="primary" onClick={handleShow}>
              Find me a house
            </Button>
            <Modal show={show} onHide={handleClose} contentClassName="my-modal">
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
      </Container>
    </Navbar>
  )
}

/*

what does type 'submit' mean for a button

*/
