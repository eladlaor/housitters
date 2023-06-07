import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import Picture from './Picture'
import { useRouter } from 'next/router'

import AvailabilitySelector from '../components/AvailabilitySelector'

import { Database } from '../types/supabase'
import { DbGenderTypes, LocationIds, USER_TYPE } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAvatarUrlState,
  selectFirstNameState,
  selectLastNameState,
  selectPrimaryUseState,
  selectUsernameState,
  selectBirthdayState,
  selectAvailabilityState,
  setAvatarUrl,
  setFirstName,
  setLastName,
  setPrimaryUse,
  setUsername,
  setBirthday,
  setAvailability,
  selectGenderState,
  setGenderState,
} from '../slices/userSlice'
import SignOut from './Buttons/SignOut'

import LocationSelector from './LocationSelector'
import { selectLocationsState } from '../slices/housitterSlice'
import { Form } from 'react-bootstrap'

type Profiles = Database['public']['Tables']['profiles']['Row']
type Housitters = Database['public']['Tables']['housitters']['Row']

export default function Account() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient<Database>()
  const user = useUser()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)

  const first_name = useSelector(selectFirstNameState)
  const last_name = useSelector(selectLastNameState)
  const username = useSelector(selectUsernameState)
  const primary_use = useSelector(selectPrimaryUseState)
  const avatar_url = useSelector(selectAvatarUrlState)
  const birthday = useSelector(selectBirthdayState)
  const availability = useSelector(selectAvailabilityState)
  const locations = useSelector(selectLocationsState)
  const gender = useSelector(selectGenderState)

  useEffect(() => {
    if (!user) {
      return
    }

    getProfile()
  }, [user])

  async function getProfile() {
    // TODO: maybe refactor, make a util func
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
              birthday`
          )
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          dispatch(setFirstName(data.first_name))
          dispatch(setUsername(data.username))
          dispatch(setPrimaryUse(data.primary_use))
          dispatch(setLastName(data.last_name))
          dispatch(setAvatarUrl(data.avatar_url))
          dispatch(setBirthday(data.birthday))
        }

        const availability = await getAvailabilityFromDb()
        dispatch(setAvailability(availability))
      }
    } catch (error) {
      alert('Error loading user data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    first_name,
    last_name,
    primary_use,
    avatar_url,
    birthday,
    gender,
    locations,
  }: {
    username: Profiles['username']
    first_name: Profiles['first_name']
    last_name: Profiles['last_name']
    primary_use: Profiles['primary_use']
    avatar_url: Profiles['avatar_url']
    birthday: Profiles['birthday']
    gender: Profiles['gender']
    locations: Housitters['locations']
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const profileUpdates = {
        id: user.id,
        updated_at: new Date().toISOString(),
        username,
        first_name,
        last_name,
        primary_use,
        avatar_url,
        birthday,
        gender,
      }

      let { error } = await supabaseClient.from('profiles').upsert(profileUpdates)
      if (error) {
        throw error
      }

      if (primary_use === USER_TYPE.Housitter) {
        let { error: housitterUpsertError } = await supabaseClient.from('housitters').upsert({
          user_id: user?.id,
          locations,
        })

        if (housitterUpsertError) {
          alert('Error updating the data: ' + housitterUpsertError)
          throw housitterUpsertError
        }
      }

      alert('Profile successfully updated!')
      if (primary_use === USER_TYPE.Housitter) {
        router.push(`/housitters/Home`)
      } else {
        router.push(`/landlords/Home`)
      }
    } catch (error) {
      alert('Error updating the data: ' + error)
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

  // TODO: unify into one function, make sure you know how to pass the function as arg, since event is passed implicitly
  function handlePrimayUseChange(event: any) {
    dispatch(setPrimaryUse(event.target.value))
  }

  function handleBirthdayChange(event: any) {
    dispatch(setBirthday(event.target.value))
  }

  function handleButtonMark(type: string, typeToCompare: string) {
    return type === typeToCompare
  }

  // TODO: why and when
  if (!user) {
    return
  }

  function handleGenderChange(e: any) {
    dispatch(setGenderState(e.target.value as string))
  }

  return (
    <div className="form-widget">
      <button
        onClick={() => {
          router.push('Home')
        }}
      >
        go to dashboard
      </button>
      <Picture
        isIntro={false}
        uid={user!.id}
        primaryUse={primary_use}
        url={avatar_url}
        size={50}
        width={50}
        height={50}
        disableUpload={false}
        bucketName={'avatars'}
        isAvatar={true}
        promptMessage={''}
        email={user!.email ? user!.email : ''}
      />

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={user!.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => dispatch(setUsername(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          type="text"
          value={first_name}
          onChange={(e) => dispatch(setFirstName(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          type="text"
          value={last_name}
          onChange={(e) => dispatch(setLastName(e.target.value))}
        />
      </div>

      <div>
        <h2>Primary Use:</h2>
        <input
          type="radio"
          value={USER_TYPE.Housitter}
          name="primary_use"
          checked={handleButtonMark(primary_use, USER_TYPE.Housitter)}
          onChange={handlePrimayUseChange}
        />{' '}
        Housitter
        <input
          type="radio"
          value={USER_TYPE.Landlord}
          name="primary_use"
          checked={handleButtonMark(primary_use, USER_TYPE.Landlord)}
          onChange={handlePrimayUseChange}
        />
        landlord
      </div>

      <div>
        <h2>Birthday</h2>
        <input
          type="date"
          name="birthday" // TODO: use these names in handlers
          value={birthday ? birthday.toString() : ''}
          onChange={handleBirthdayChange}
        />
      </div>

      <div>
        <h2>Availability</h2>
        {availability.map((period, index) => (
          <AvailabilitySelector
            period={period}
            index={index}
            key={index}
            updateDbInstantly={false}
          />
        ))}
      </div>

      <div>
        <h2>Locations</h2>
        <LocationSelector
          selectionType="checkbox"
          isHousitter={true}
          showCustomLocations={locations.length < Object.values(LocationIds).length}
          updateDbInstantly={false}
        />
      </div>

      <div>
        <h2>Gender</h2>
        <Form>
          <Form.Select
            value={gender ? gender : DbGenderTypes.Unknown}
            onChange={handleGenderChange}
          >
            <option value={DbGenderTypes.Male}>Male</option>
            <option value={DbGenderTypes.Female}>Female</option>
            <option value={DbGenderTypes.NonBinary}>Non Binary</option>
            <option value={DbGenderTypes.Unknown}>I Prefer not to say</option>
          </Form.Select>
        </Form>
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => {
            updateProfile({
              username,
              first_name,
              last_name,
              primary_use,
              avatar_url,
              birthday,
              gender,
              locations,
            })
          }}
          disabled={loading}
        >
          {loading ? 'loading ...' : 'update'}
        </button>
      </div>

      <div>
        <SignOut />
      </div>
    </div>
  )
}
