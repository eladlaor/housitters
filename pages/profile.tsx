import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

import { Database } from '../types/supabase'
import { UserType } from '../utils/constants'
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

import { selectExperienceState, selectLocationsState } from '../slices/housitterSlice'
import UserDetails from '../components/Profile/UserDetails'

export default function Account() {
  const supabaseClient = useSupabaseClient<Database>()
  const user = useUser()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)

  const primary_use = useSelector(selectPrimaryUseState)

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

  return user && <UserDetails isHousitter={primary_use === UserType.Housitter} />
}
