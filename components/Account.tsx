import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import Avatar from './Avatar'
import { useRouter } from 'next/router'

import { Database } from '../utils/database.types'
import { HOUSITTERS_ROUTES, HOUSEOWNERS_ROUTES, USER_TYPE } from '../utils/constants'

type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Account({
  session,
  userFromQuery,
}: {
  session: Session
  userFromQuery: any
}) {
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()
  const user = useUser() ? useUser() : userFromQuery
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<Profiles['username']>(null)
  const [first_name, setFirstName] = useState<Profiles['first_name']>(null)
  const [last_name, setLastName] = useState<Profiles['last_name']>(null)
  const [primary_use, setPrimaryUse] = useState<Profiles['primary_use']>(USER_TYPE.None)
  const [secondary_use, setSecondaryUse] = useState<Profiles['secondary_use']>(USER_TYPE.None)
  const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null)

  useEffect(() => {
    getProfile()
  }, [session, primary_use])

  async function getProfile() {
    // TODO: take it out to utils
    try {
      setLoading(true)
      if (!user) {
        throw new Error('No user')
      } else {
        let { data, error, status } = await supabase
          .from('profiles')
          .select(`username, first_name, last_name, primary_use, secondary_use, avatar_url`)
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error
        }

        if (data) {
          setUsername(data.username)
          setFirstName(data.first_name)
          setLastName(data.last_name)
          setPrimaryUse(data.primary_use)
          setSecondaryUse(data.secondary_use)
          setAvatarUrl(data.avatar_url)
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
  }: {
    username: Profiles['username']
    first_name: Profiles['first_name']
    last_name: Profiles['last_name']
    primary_use: Profiles['primary_use']
    secondary_use: Profiles['secondary_use']
    avatar_url: Profiles['avatar_url']
  }) {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

      const updates = {
        id: user.id,
        username,
        first_name,
        last_name,
        primary_use,
        secondary_use,
        avatar_url,
        updated_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)
      if (error) {
        throw error
      } else {
        alert('Profile successfully updated!')
      }
    } catch (error) {
      alert('Error updating the data!')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        uid={user!.id} // verify i know what this means
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({
            username,
            first_name,
            last_name,
            primary_use,
            secondary_use,
            avatar_url: url,
          })
        }}
      />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          type="text"
          value={first_name || ''}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          type="text"
          value={last_name || ''}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div>
        <h2>Primary Use:</h2>
        <input
          type="radio"
          value="housitter"
          name="primary_use"
          checked={primary_use === USER_TYPE.Housitter ? true : false}
          onChange={handlePrimayUseChange}
        />{' '}
        Housitter
        <input
          type="radio"
          value="houseowner"
          name="primary_use"
          checked={primary_use === USER_TYPE.HouseOwner ? true : false}
        />
        HouseOwner
      </div>

      <div>
        <h2>Secondary Use:</h2>
        <input
          type="radio"
          value="housitter"
          name="secondary_use"
          disabled={primary_use === USER_TYPE.Housitter ? true : false}
          onChange={handleSecondaryUseChange}
        />{' '}
        Housitter
        <input
          type="radio"
          value="houseowner"
          name="secondary_use"
          disabled={primary_use === USER_TYPE.HouseOwner ? true : false}
        />{' '}
        HouseOwner
        <input type="radio" value="none" name="secondary_use" defaultChecked={false} /> None
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
            })

            console.log(`primary use is: ${primary_use}`)

            if (primary_use === USER_TYPE.Housitter) {
              router.push(`/housitters/Home?username=${username}&firstName=${first_name}`)
            } else {
              router.push(`/house-owners/Home?username=${username}&firstName=${first_name}`)
            }
          }}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button
          className="button block"
          onClick={() => {
            supabase.auth.signOut()
            router.push('/')
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )

  function handlePrimayUseChange(event: any) {
    setPrimaryUse(event.target.value)
  }

  function handleSecondaryUseChange(event: any) {
    setSecondaryUse(event.target.value)
  }
}
