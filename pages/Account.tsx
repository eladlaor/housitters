import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

import { Database } from '../types/supabase'
import { USER_TYPE } from '../utils/constants'
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
  setEmailState,
} from '../slices/userSlice'

import { selectLocationsState } from '../slices/housitterSlice'
import { Button, Form } from 'react-bootstrap'
import UserDetails from '../components/Profile/UserDetails'
import HomeNavbar from '../components/HomeNavbar'

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
          dispatch(setFirstName(data.first_name))
          dispatch(setUsername(data.username))
          dispatch(setPrimaryUse(data.primary_use))
          dispatch(setLastName(data.last_name))
          dispatch(setAvatarUrl(data.avatar_url))
          dispatch(setBirthday(data.birthday))
          dispatch(setGenderState(data.gender))
          dispatch(setEmailState(data.email))
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
      if (!user) {
        alert(`no user`)
        return
      }

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
        alert(`failed updating profile: ${error}`)
        debugger
        return
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

  return (
    user && (
      <div>
        <HomeNavbar userType={primary_use} />

        <UserDetails isHousitter={primary_use === USER_TYPE.Housitter} />

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
          ></button>
        </div>
      </div>
    )
  )
}
