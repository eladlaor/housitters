import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import Picture from './Picture'
import { useRouter } from 'next/router'

import AvailabilityPeriod from '../components/AvailabilityPeriod'

import { Database } from '../types/supabase'
import { HOUSITTERS_ROUTES, LANDLORDS_ROUTES, USER_TYPE } from '../utils/constants'
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
} from '../slices/userSlice'
import SignOut from './Buttons/SignOut'

import { parseDateMultiRange } from '../utils/dates'

type Profiles = Database['public']['Tables']['profiles']['Row']

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

  useEffect(() => {
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
  }: {
    username: Profiles['username']
    first_name: Profiles['first_name']
    last_name: Profiles['last_name']
    primary_use: Profiles['primary_use']
    avatar_url: Profiles['avatar_url']
    birthday: Profiles['birthday']
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        updated_at: new Date().toISOString(),
        username,
        first_name,
        last_name,
        primary_use,
        avatar_url,
        birthday,
      }

      let { error } = await supabaseClient.from('profiles').upsert(updates)
      if (error) {
        throw error
      } else {
        alert('Profile successfully updated!')
        if (primary_use === USER_TYPE.Housitter) {
          router.push(`/housitters/Home`)
        } else {
          router.push(`/landlords/Home`)
        }
      }
    } catch (error) {
      alert('Error updating the data!')
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

    if (availableDates) {
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

  if (!user) {
    return <div>no user</div>
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
        uid={user!.id} // verify i know what this means
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          dispatch(setAvatarUrl(url))
          updateProfile({
            username,
            first_name,
            last_name,
            primary_use,
            avatar_url: url,
            birthday,
          })
        }}
        disableUpload={false}
        bucketName="avatars"
      />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={user.email} disabled />
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
          value={birthday ? birthday.toString() : undefined}
          onChange={handleBirthdayChange}
        />
      </div>

      <div>
        <h2>Availability</h2>
        {availability.map((period, index) => (
          <AvailabilityPeriod period={period} index={index} />
        ))}
      </div>

      <div>
        <h2>Preferred Location</h2>
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
