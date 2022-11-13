import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient, Session } from '@supabase/auth-helpers-react'
import Avatar from './Avatar'
import { UserType } from '../utils/database.types'
import { useRouter } from 'next/router'

import { Database } from '../utils/database.types'
type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Account({ session }: { session: Session }) {
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<Profiles['username']>(null)
  const [first_name, setFirstName] = useState<Profiles['first_name']>(null)
  const [last_name, setLastName] = useState<Profiles['last_name']>(null)
  const [primary_use, setPrimaryUse] = useState<Profiles['primary_use']>(UserType.HouseOwner)
  const [secondary_use, setSecondaryUse] = useState<Profiles['secondary_use']>(UserType.None)
  const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null)

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!user) throw new Error('No user')

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

      <div onChange={handlePrimayUseChange}>
        <h2>Primary Use:</h2>
        <input
          type="radio"
          value="housitter"
          name="primary_use"
          defaultChecked={primary_use === UserType.Housitter ? true : false}
        />{' '}
        Housitter
        <input
          type="radio"
          value="houseowner"
          name="primary_use"
          defaultChecked={primary_use === UserType.HouseOwner ? true : false}
        />{' '}
        HouseOwner
      </div>

      <div onChange={handleSecondaryUseChange}>
        <h2>Secondary Use:</h2>
        <input type="radio" value="housitter" name="secondary_use" /> Housitter
        <input type="radio" value="houseowner" name="secondary_use" /> HouseOwner
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

            router.push('/test/goody') // TODO: should be changed to redirect back home, to a personalized page.
          }}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
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
