import { useSupabaseClient } from '@supabase/auth-helpers-react'
import {
  DbGenderTypes,
  LocationIds,
  MandatorySignupFields,
  NoDescriptionDefaultMessage,
  PageRoutes,
  SIGNUP_FORM_PROPS,
  SignupErrorMessages,
  UserType,
} from '../../utils/constants'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { DefaultAvailablePostType, SignupForm } from '../../types/clientSide'
import { useEffect, useState } from 'react'
import {
  selectAvailabilityState,
  selectAvatarUrlState,
  setAvailability,
  setAvatarUrl,
  setFirstName,
  setLastName,
  setPrimaryUse,
} from '../../slices/userSlice'
import {
  selectLocationState as landlordSelectLocationState,
  selectPetsState,
} from '../../slices/landlordSlice'
import {
  selectLocationsState as housitterSelectLocationsState,
  selectExperienceState,
  setExperienceState,
} from '../../slices/housitterSlice'
import { Button, Form, Modal, Spinner, Container } from 'react-bootstrap'
import Picture from '../../components/Picture'
import PetsCounter from '../../components/PetsCounter'
import CountAndUpdate from '../../components/utils/CountAndUpdate'
import { Database } from '../../types/supabase'
import { setAvailablePosts } from '../../slices/availablePostsSlice'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

export default function Signup() {
  const router = useRouter()
  const dispatch = useDispatch()
  const supabaseClient = useSupabaseClient()
  const { t } = useTranslation()

  const [userType, setUserType] = useState((router.query.userType || UserType.Landlord) as string)
  const [isHousitter, setIsHousitter] = useState(userType === UserType.Housitter)

  const initialFormState: SignupForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType,
    avatarUrl: '',
    gender: DbGenderTypes.Unknown,
  }

  const [form, setForm] = useState(initialFormState)
  const [isSignupInProgress, setIsSignupInProgress] = useState(false)

  const avatarUrl = useSelector(selectAvatarUrlState)
  const availability = useSelector(selectAvailabilityState)

  const landlordLocation = useSelector(landlordSelectLocationState)
  const housitterLocations = useSelector(housitterSelectLocationsState)
  const pets = useSelector(selectPetsState)
  const experience = useSelector(selectExperienceState)

  const [showSignupErrorModal, setShowSignupErrorModal] = useState(false)
  const [signupErrorMessage, setSignupErrorMessage] = useState('')
  const [missingMandatorySignupFields, setMissingMandatorySignupFields] = useState([] as string[])

  const handleCloseSignupErrorModal = () => {
    setShowSignupErrorModal(false)
  }

  useEffect(() => {
    setFormField('avatarUrl', avatarUrl)
  }, [avatarUrl])

  const [showPassword, setShowPassword] = useState(false)

  function renderSignupErrorHandler(signupErrorMessage: string) {
    switch (signupErrorMessage) {
      case SignupErrorMessages.ExistingEmail:
        return (
          <>
            <Button variant="secondary" onClick={handleCloseSignupErrorModal}>
              {t('signup.replaceEmail')}
            </Button>
            <Button variant="primary" onClick={() => router.push(PageRoutes.Auth.Login)}>
              {t('signup.signin')}
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
    setForm((previousState: any) => {
      return {
        ...previousState,
        [field]: value,
      }
    })
  }

  async function handleSignup(e: any) {
    e.preventDefault()

    const missingFieldsKeyNames = Object.keys(form).filter(
      (fieldKey: string) => ((form as unknown as Record<string, string>)[fieldKey] as string) === ''
    )

    const missingFieldsDefinitionsForUser: string[] = []
    missingFieldsKeyNames.forEach((key) => {
      missingFieldsDefinitionsForUser.push((MandatorySignupFields as Record<string, string>)[key])
    })

    if (missingFieldsDefinitionsForUser.length !== 0) {
      setSignupErrorMessage(SignupErrorMessages.MissingFields)
      setMissingMandatorySignupFields(missingFieldsDefinitionsForUser)
      setShowSignupErrorModal(true)
      return
    }

    setIsSignupInProgress(true)

    let { data, error } = await supabaseClient.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error) {
      switch (true) {
        case error.message.includes(SignupErrorMessages.ExistingEmail):
          setSignupErrorMessage(SignupErrorMessages.ExistingEmail)
          setIsSignupInProgress(false)
          setShowSignupErrorModal(true)

          break
        default:
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
        primary_use: userType,
        avatar_url: avatarUrl,
        email: form.email,
        gender: form.gender,
      }

      let { error: profileError } = await supabaseClient
        .from('profiles')
        .upsert({ ...newProfile, updated_at: new Date() })
      if (profileError) {
        console.log(
          `Error when upserting new ${
            isHousitter ? UserType.Housitter : UserType.Landlord
          } to \'profiles\' table: ${profileError.message}`
        )
        debugger
        router.push('/')
      }

      dispatch(setAvatarUrl(newProfile.avatar_url))
      dispatch(setFirstName(newProfile.first_name))
      dispatch(setLastName(newProfile.last_name))
      dispatch(setPrimaryUse(userType))

      if (!isHousitter) {
        const newlandlord = {
          user_id: userId,
          location: landlordLocation || LocationIds.Center,
        }

        let { error: landlordError } = await supabaseClient.from('landlords').upsert(newlandlord)
        if (landlordError) {
          console.log(`Error when upserting new landlord to \'landlords\' table: ${landlordError}`)
          debugger
          throw landlordError
        }

        for (const period of availability) {
          let { error: availabilityError } = await supabaseClient.from('available_dates').upsert({
            user_id: userId,
            start_date: period.startDate,
            end_date: period.endDate,
            user_type: UserType.Landlord,
          })
          if (availabilityError) {
            console.log(`failed upserting landlord to available_dates table: ${error}`)
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
          console.log(`error uploading pets: ${petsError}`)
          debugger
          throw petsError
        }

        const defaultPost: Partial<Database['public']['Tables']['posts']['Row']> = {
          created_at: new Date().toISOString(),
          description: NoDescriptionDefaultMessage,
          images_urls: null,
          is_active: true,
          landlord_id: userId,
          title: `${form.firstName} ${form.lastName}`,
        }

        const { error: newPostError } = await supabaseClient.from('posts').upsert(defaultPost)
        if (newPostError) {
          console.log(
            `Error creating a default post for ${form.firstName}: ${newPostError}. Please create a new post from the dashboard`
          )
          debugger
        }

        const defaultPostRedux: DefaultAvailablePostType = {
          landlordId: userId,
          landlordAvatarUrl: avatarUrl,
          landlordFirstName: form.firstName,
          landlordLastName: form.lastName,
          title: `${form.firstName} ${form.lastName}`,
          description: `a description hasn't been written yet`,
          location: landlordLocation,
          dogs: pets.dogs,
          cats: pets.cats,
          imagesUrls: [],
        }

        dispatch(setAvailablePosts([defaultPostRedux]))
      } else if (UserType.Housitter) {
        const newHousitter = {
          user_id: userId,
          locations: housitterLocations || [LocationIds.Center],
          experience,
          updated_at: new Date(),
        }

        let { error } = await supabaseClient.from('housitters').upsert(newHousitter)
        if (error) {
          console.log(`failed upserting housitter to housitters table: ${error}`)
          debugger
          throw error
        }

        availability.forEach(async (period) => {
          let { error: availabilityError } = await supabaseClient.from('available_dates').upsert({
            user_id: userId,
            start_date: period.startDate,
            end_date: period.endDate,
            user_type: UserType.Housitter,
          })
          if (availabilityError) {
            console.log(`failed upserting housitter to available_dates table: ${error}`)
            debugger
            throw error
          }
        })
      }

      alert(`Welcome ${form.firstName} ${form.lastName}!`)
    }

    const homeProps = {
      isAfterSignup: true,
    }

    const redirectPath =
      userType === UserType.Housitter
        ? PageRoutes.HousitterRoutes.Home
        : PageRoutes.LandlordRoutes.Home

    router.push({ pathname: redirectPath, query: homeProps })
  }

  return (
    <Container>
      {isSignupInProgress ? (
        <Spinner animation="border" role="status" />
      ) : (
        <Form className="d-flex flex-column justify-content-center align-items-center">
          <Form.Group className="mb-3 col-3  text-center" controlId={SIGNUP_FORM_PROPS.FIRST_NAME}>
            <Form.Label>{t('signup.firstName')}</Form.Label>
            <Form.Control
              type="text"
              placeholder=""
              value={form.firstName as string}
              onChange={(e) => {
                setFormField(SIGNUP_FORM_PROPS.FIRST_NAME, e.target.value)
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3  col-3  text-center" controlId={SIGNUP_FORM_PROPS.LAST_NAME}>
            <Form.Label>{t('signup.lastName')}</Form.Label>
            <Form.Control
              type="text"
              placeholder=""
              value={form.lastName}
              onChange={(e) => {
                setFormField(SIGNUP_FORM_PROPS.LAST_NAME, e.target.value)
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3 col-3  text-center" controlId={SIGNUP_FORM_PROPS.EMAIL}>
            <Form.Label>{t('signup.email')}</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) => {
                setFormField(SIGNUP_FORM_PROPS.EMAIL, e.target.value)
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3 col-3  text-center" controlId={SIGNUP_FORM_PROPS.PASSWORD}>
            <Form.Label>{t('signup.password')}</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={form.password}
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
                {showPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </Button>
              <hr />
            </div>
          </Form.Group>
          <Form.Group className="mb-3 col-3  text-center">
            <Form.Label>{t('signup.userType')}</Form.Label>
            <Form.Select
              value={userType}
              onChange={(e) => {
                const updatedUserType = e.target.value
                setFormField(SIGNUP_FORM_PROPS.USER_TYPE, updatedUserType)
                setIsHousitter(updatedUserType === UserType.Housitter)
                setUserType(updatedUserType)
              }}
            >
              <option value={UserType.Landlord}>{t('userType.landlord')}</option>
              <option value={UserType.Housitter}>{t('userType.housitter')}</option>
            </Form.Select>
          </Form.Group>
          {!isHousitter && (
            <Form.Group className="mb-2 col-3  text-center">
              <Form.Label>{t('signup.pets')}</Form.Label>
              <PetsCounter />
            </Form.Group>
          )}
          {isHousitter && (
            <Form.Group className="col-3">
              <Form.Label className="mb-2">{t('signup.experience')}</Form.Label>
              <br />
              <Form.Text className="mb-2" muted>
                {t('signup.experienceExplain')}
              </Form.Text>
              <CountAndUpdate valueToCount={experience} reduxReducer={setExperienceState} />
              <hr className="col-3" />
            </Form.Group>
          )}
          <Form.Group className="col-3 text-center">
            <Form.Label>{t('signup.gender')}</Form.Label>
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

          <Form.Group className="col-3 text-center">
            <Picture
              isIntro={true}
              uid=""
              primaryUse={UserType.Landlord}
              url={avatarUrl}
              size={100}
              width={100} // should persist dimensions of image upon upload
              height={100}
              disableUpload={false}
              bucketName="avatars"
              isAvatar={true}
              promptMessage={t('signup.profilePic')}
              email={form.email}
              isRounded={true}
            />
          </Form.Group>
          <Button variant="primary" type="submit" onClick={handleSignup} className="mt-3">
            {t('signup.submit')}
          </Button>
        </Form>
      )}
      <Modal show={showSignupErrorModal} onHide={handleCloseSignupErrorModal}>
        <Modal.Header>
          <Modal.Title className="text-center w-100">{t('signup.signupError')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          {signupErrorMessage === SignupErrorMessages.ExistingEmail
            ? 'This email is already registered'
            : signupErrorMessage}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          {renderSignupErrorHandler(signupErrorMessage)}
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
