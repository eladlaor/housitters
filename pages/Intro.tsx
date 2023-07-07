import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  DbGenderTypes,
  LocationIds,
  MandatorySignupFields,
  SIGNUP_FORM_PROPS,
  SignupErrorMessages,
  USER_TYPE,
} from '../utils/constants'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { DefaultAvailablePostType, SignupForm } from '../types/clientSide'
import { useEffect, useState } from 'react'
import {
  selectAvailabilityState,
  selectAvatarUrlState,
  selectPrimaryUseState,
  setAvailability,
  setAvatarUrl,
  setFirstName,
  setIsLoggedState,
  setLastName,
  setPrimaryUse,
} from '../slices/userSlice'
import {
  selectLocationState as landlordSelectLocationState,
  selectPetsState,
} from '../slices/landlordSlice'
import {
  selectLocationsState as housitterSelectLocationsState,
  selectExperienceState,
  setExperienceState,
} from '../slices/housitterSlice'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import Picture from '../components/Picture'
import PetsCounter from '../components/PetsCounter'
import AvailabilitySelector from '../components/AvailabilitySelector'
import LocationSelector from '../components/LocationSelector'
import CountAndUpdate from '../components/utils/CountAndUpdate'
import { Database } from '../types/supabase'
import { setAvailablePosts } from '../slices/availablePostsSlice'
import React from 'react'

export default function Intro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()

  const { userType } = router.query
  const isHousitter = userType === USER_TYPE.Housitter

  const initialFormState: SignupForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    avatarUrl: '',
    gender: DbGenderTypes.Unknown,
  }

  const [form, setForm] = useState(initialFormState)
  const [isSignupInProgress, setIsSignupInProgress] = useState(false)

  const avatarUrl = useSelector(selectAvatarUrlState)
  const availability = useSelector(selectAvailabilityState)
  const primaryUse = useSelector(selectPrimaryUseState)

  const landlordLocation = useSelector(landlordSelectLocationState)
  const housitterLocations = useSelector(housitterSelectLocationsState)
  const pets = useSelector(selectPetsState)
  const experience = useSelector(selectExperienceState)

  const [showSignupErrorModal, setShowSignupErrorModal] = useState(false)
  const [signupErrorMessage, setSignupErrorMessage] = useState('')
  const [missingMandatorySignupFields, setMissingMandatorySignupFields] = useState([] as string[])

  const handleCloseSignupErrorModal = () => {
    setShowSignupErrorModal(false)
    setShowModal(true)
  }

  useEffect(() => {
    setFormField('avatarUrl', avatarUrl)
  }, [avatarUrl])

  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  function renderSignupErrorHandler(signupErrorMessage: string) {
    switch (signupErrorMessage) {
      case SignupErrorMessages.ExistingEmail:
        return (
          <>
            <Button variant="secondary" onClick={handleCloseSignupErrorModal}>
              Replace Email
            </Button>
            <Button variant="primary" onClick={() => router.push('/Login')}>
              Sign In
            </Button>
          </>
        )
      case SignupErrorMessages.MissingFields:
        return (
          <div>
            <div className="d-flex flex-column justify-content-center align-items-center">
              <h5>
                Missing Mandatory Fields: <br />{' '}
              </h5>
              {Object.values(missingMandatorySignupFields).map((field, index) => (
                <div key={index} className="align-items-center">
                  {field}
                  <br />
                </div>
              ))}
            </div>
            <Button
              style={{ width: '300px', maxWidth: '100%' }}
              variant="secondary"
              onClick={handleCloseSignupErrorModal}
              className="mt-3"
            >
              Complete the Form
            </Button>
          </div>
        )
      default:
        return <div>default</div>
    }
  }

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

    const missingFieldsKeyNames = Object.keys(form).filter(
      (fieldKey: string) => ((form as unknown as Record<string, string>)[fieldKey] as string) === ''
    )

    const missingFieldsDefinitionsForUser: string[] = []
    missingFieldsKeyNames.forEach((key) => {
      missingFieldsDefinitionsForUser.push((MandatorySignupFields as Record<string, string>)[key])
    })

    if (missingFieldsDefinitionsForUser.length !== 0) {
      setShowModal(false)
      setSignupErrorMessage(SignupErrorMessages.MissingFields)
      setMissingMandatorySignupFields(missingFieldsDefinitionsForUser)
      setShowSignupErrorModal(true)
      return
    }

    setShowModal(false)
    setIsSignupInProgress(true)

    let { data, error } = await supabaseClient.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      switch (true) {
        case error.message.includes(SignupErrorMessages.ExistingEmail.toLowerCase()):
          setShowModal(false)
          setSignupErrorMessage(SignupErrorMessages.ExistingEmail)
          setIsSignupInProgress(false)
          setShowSignupErrorModal(true)

          break
        default:
          alert(`Sign up failed with the follwing error: ${error.message}`)
          router.push('/')
      }
      return
    }

    if (data && data.user) {
      const userId = data.user.id

      const newProfile = {
        id: userId,
        username: form.email.substring(0, form.email.indexOf('@')),
        first_name: form.firstName,
        last_name: form.lastName,
        primary_use: primaryUse,
        avatar_url: avatarUrl,
        email: form.email,
        gender: form.gender,
      }

      let { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({ ...newProfile, updated_at: new Date() })
      if (profileError) {
        alert(
          `Error when upserting new ${
            isHousitter ? USER_TYPE.Housitter : USER_TYPE.Landlord
          } to \'profiles\' table: ${profileError.message}`
        )
        debugger
        router.push('/')
      }

      dispatch(setAvatarUrl(newProfile.avatar_url))
      dispatch(setFirstName(newProfile.first_name))
      dispatch(setLastName(newProfile.last_name))

      if (!isHousitter) {
        const newlandlord = {
          user_id: userId,
          location: landlordLocation,
        }

        let { error: landlordError } = await supabaseClient.from('landlords').upsert(newlandlord)
        if (landlordError) {
          alert(`Error when upserting new landlord to \'landlords\' table: ${landlordError}`)
          throw landlordError
        }

        for (const period of availability) {
          let { error: availabilityError } = await supabaseClient.from('available_dates').upsert({
            user_id: userId,
            start_date: period.startDate,
            end_date: period.endDate,
            user_type: USER_TYPE.Landlord,
          })
          if (availabilityError) {
            alert(`failed upserting landlord to available_dates table: ${error}`)
            debugger
            throw error
          }
        }

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

        const defaultPost: Partial<Database['public']['Tables']['posts']['Row']> = {
          created_at: new Date().toISOString(),
          description: `a description hasn\n't been written yet`,
          images_urls: null,
          is_active: true,
          landlord_id: userId,
          title: 'available house',
        }

        const { error: newPostError } = await supabaseClient.from('posts').upsert(defaultPost)
        if (newPostError) {
          alert(
            `Error creating a default post for ${form.firstName}: ${newPostError}. Please create a new post from the dashboard`
          )
          debugger
        }

        const defaultPostRedux: DefaultAvailablePostType = {
          landlordId: userId,
          landlordAvatarUrl: avatarUrl,
          landlordFirstName: form.firstName,
          landlordLastName: form.lastName,
          title: 'available house',
          description: `a description hasn\n't been written yet`,
          location: landlordLocation,
          dogs: pets.dogs,
          cats: pets.cats,
          imagesUrls: [],
        }

        dispatch(setAvailablePosts([defaultPostRedux]))
      } else if (USER_TYPE.Housitter) {
        const newHousitter = {
          user_id: userId,
          locations: housitterLocations,
          experience,
          updated_at: new Date(),
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
      alert(`Successfully created new ${primaryUse}: ${form.firstName} ${form.lastName}`)
    }

    const homeProps = {
      isAfterSignup: true,
    }
    router.push({ pathname: `${primaryUse}s/Home`, query: homeProps })
    setIsSignupInProgress(false)
  }
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      {isSignupInProgress ? (
        <Spinner animation="border" role="status" />
      ) : (
        <div>
          <div className="position-absolute top-50 start-50 translate-middle text-center">
            <div>
              <h1 className="mb-4">
                let's find
                {isHousitter ? ' a woof over your head' : ' a housitter'}
              </h1>
            </div>
            <div>
              <h3>When?</h3>
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
              <h3>{isHousitter ? 'Where do you want to be?' : 'Where do you live?'}</h3>
              <LocationSelector
                selectionType={isHousitter ? 'checkbox' : 'radio'}
                isHousitter={isHousitter}
                showCustomLocations={
                  isHousitter
                    ? housitterLocations.length > 0 &&
                      housitterLocations.length < Object.values(LocationIds).length
                    : true
                }
                updateDbInstantly={false}
              />
            </div>
            <div>
              <Button
                variant="success"
                onClick={handleShow}
                className="btn-lg rounded-pill w-50 mt-3"
              >
                Find
              </Button>
              <Modal show={showModal} onHide={handleClose} contentClassName="landlord-signup-modal">
                <Modal.Header closeButton>
                  <Modal.Title style={{ color: 'black' }}>One more step</Modal.Title>
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
                      <div className="position-relative">
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
                        <CountAndUpdate
                          valueToCount={experience}
                          reduxReducer={setExperienceState}
                        />
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
                    <Button variant="primary" type="submit" onClick={handleSignUp} className="mt-3">
                      Submit
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
              <Modal show={showSignupErrorModal} onHide={handleCloseSignupErrorModal}>
                <Modal.Header>
                  <Modal.Title className="text-center w-100">Signup Error</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex justify-content-center">
                  {signupErrorMessage}
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-center">
                  {renderSignupErrorHandler(signupErrorMessage)}
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
