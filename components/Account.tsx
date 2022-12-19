import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css' // theme css file

import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import Avatar from './Avatar'
import { useRouter } from 'next/router'

import { Database } from '../utils/database.types'
import { HOUSITTERS_ROUTES, HOUSEOWNERS_ROUTES, USER_TYPE } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAvatarUrlState,
  selectFirstNameState,
  selectLastNameState,
  selectPrimaryUseState,
  selectSecondaryUseState,
  selectUsernameState,
  selectBirthdayState,
  setAvatarUrl,
  setFirstName,
  setLastName,
  setPrimaryUse,
  setSecondaryUse,
  setUsername,
  setBirthday,
  selectIsLoggedState,
  setIsLoggedState,
} from '../slices/userSlice'
import SignOut from './Buttons/SignOut'

type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Account() {
  const router = useRouter()
  const supabaseClient = useSupabaseClient<Database>()
  const user = useUser()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)

  const isLogged = useSelector(selectIsLoggedState)
  const first_name = useSelector(selectFirstNameState)
  const last_name = useSelector(selectLastNameState)
  const username = useSelector(selectUsernameState)
  const primary_use = useSelector(selectPrimaryUseState)
  const secondary_use = useSelector(selectSecondaryUseState)
  const avatar_url = useSelector(selectAvatarUrlState)
  const birthday = useSelector(selectBirthdayState)

  // const primaryUseSelector = useSelector(selectPrimaryUseState)

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
            secondary_use, 
            avatar_url, 
            birthday`
          )
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          dispatch(setSecondaryUse(data.secondary_use))
          dispatch(setFirstName(data.first_name))
          dispatch(setUsername(data.username))
          dispatch(setPrimaryUse(data.primary_use))
          dispatch(setLastName(data.last_name))
          dispatch(setAvatarUrl(data.avatar_url))
          dispatch(setBirthday(data.birthday))
        }
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
    secondary_use,
    avatar_url,
    birthday,
  }: {
    username: Profiles['username']
    first_name: Profiles['first_name']
    last_name: Profiles['last_name']
    primary_use: Profiles['primary_use']
    secondary_use: Profiles['secondary_use']
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
        secondary_use,
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
          router.push(`/house-owners/Home`)
        }
      }
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>no user</div>
  }

  const selectionRange = {
    startDate: new Date(0),
    endDate: new Date(),
    key: 'selection',
  }

  return (
    <div className="form-widget">
      <Avatar
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
            secondary_use,
            avatar_url: url,
            birthday,
          })
        }}
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
          disabled={handleButtonMark(secondary_use, USER_TYPE.Housitter)}
          checked={handleButtonMark(primary_use, USER_TYPE.Housitter)}
          onChange={handlePrimayUseChange}
        />{' '}
        Housitter
        <input
          type="radio"
          value={USER_TYPE.HouseOwner}
          name="primary_use"
          disabled={handleButtonMark(secondary_use, USER_TYPE.HouseOwner)}
          checked={handleButtonMark(primary_use, USER_TYPE.HouseOwner)}
          onChange={handlePrimayUseChange}
        />
        HouseOwner
      </div>

      <div>
        <h2>Secondary Use:</h2>
        <input
          type="radio"
          value={USER_TYPE.Housitter}
          name="secondary_use"
          disabled={handleButtonMark(primary_use, USER_TYPE.Housitter)}
          checked={handleButtonMark(secondary_use, USER_TYPE.Housitter)}
          onChange={handleSecondaryUseChange}
        />
        Housitter
        <input
          type="radio"
          value={USER_TYPE.HouseOwner}
          name="secondary_use"
          disabled={handleButtonMark(primary_use, USER_TYPE.HouseOwner)}
          checked={handleButtonMark(secondary_use, USER_TYPE.HouseOwner)}
          onChange={handleSecondaryUseChange}
        />
        HouseOwner
        <input
          type="radio"
          value={USER_TYPE.None}
          name="secondary_use"
          checked={handleButtonMark(secondary_use, USER_TYPE.None)}
          onChange={handleSecondaryUseChange}
        />
        None
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
        <p>this is not looking great because no styles are applied</p>
        <DateRangePicker ranges={[selectionRange]} onChange={handleDatesChange} color="red" />
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
              secondary_use,
              avatar_url,
              birthday,
            })
          }}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <SignOut />
      </div>
    </div>
  )

  // TODO: unify into one function, make sure you know how to pass the function as arg, since event is passed implicitly
  function handlePrimayUseChange(event: any) {
    dispatch(setPrimaryUse(event.target.value))
  }

  function handleSecondaryUseChange(event: any) {
    dispatch(setSecondaryUse(event.target.value))
  }

  function handleBirthdayChange(event: any) {
    dispatch(setBirthday(event.target.value))
  }

  function handleDatesChange(ranges: any) {
    console.log(ranges)
  }

  function handleButtonMark(type: string, typeToCompare: string) {
    return type === typeToCompare
  }
}
