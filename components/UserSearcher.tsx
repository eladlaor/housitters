import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import { Typeahead } from 'react-bootstrap-typeahead'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

import { Database } from '../types/supabase'
import PublicProfile from './PublicProfile'
import { DbGenderTypes, USER_TYPE } from '../utils/constants'

export default function UserSearcher() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  type Profiles = Database['public']['Tables']['profiles']['Row']

  const noSelectedSearchedUser: Profiles = {
    avatar_url: '',
    birthday: '',
    email: '',
    first_name: '',
    id: 'no-user',
    last_name: '',
    primary_use: '',
    social_media_url: '',
    updated_at: '',
    username: '',
    gender: DbGenderTypes.Unknown as Profiles['gender'],
    visible: true,
  }

  const [selectedSearchedUser, setSelectedSearchedUser] = useState(
    noSelectedSearchedUser as Database['public']['Tables']['profiles']['Row']
  )
  const [showSelectedSearchedUserModal, setShowSelectedSearchedUserModal] = useState(false)
  const [allProfiles, setAllProfiles] = useState(
    [] as Database['public']['Tables']['profiles']['Row'][]
  )
  const [searchFilter, setSearchFilter] = useState('all')

  function handleSelectedSearchedUser(selectedUser: any[]) {
    if (selectedUser && selectedUser.length > 0) {
      setSelectedSearchedUser(selectedUser[0])
      setShowSelectedSearchedUserModal(true)
    }
  }

  function handleCloseSelectedSearchedUserModal() {
    setSelectedSearchedUser(noSelectedSearchedUser)
    setShowSelectedSearchedUserModal(false)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const loadProfiles = async () => {
      console.log('loading')
      const { error, data } = await supabaseClient
        .from('profiles')
        .select(
          'id, first_name, last_name, primary_use, username, social_media_url, email, birthday, avatar_url'
        )
        .neq('id', user!.id)

      if (error) {
        alert(`failed loading profiles: ${error.message}`)
        debugger
        throw error
      }

      if (data && data.length > 0) {
        setAllProfiles(data as Database['public']['Tables']['profiles']['Row'][])
      }
    }

    loadProfiles()
  }, [user, searchFilter])

  return (
    <div className="search-container">
      <Typeahead
        id="user-search"
        labelKey="first_name"
        options={allProfiles.filter(
          (profile) => searchFilter === 'all' || profile.primary_use === searchFilter
        )}
        placeholder="Search for a user by name"
        onChange={handleSelectedSearchedUser}
        maxResults={3}
        renderMenuItemChildren={(option) => (
          <div>
            {(option as (typeof allProfiles)[0]).first_name}{' '}
            {(option as (typeof allProfiles)[0]).last_name}
          </div>
        )}
      ></Typeahead>
      {showSelectedSearchedUserModal && selectedSearchedUser.id !== 'no-user' && (
        <Modal show={showSelectedSearchedUserModal} onHide={handleCloseSelectedSearchedUserModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              This is {selectedSearchedUser.first_name} {selectedSearchedUser.last_name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PublicProfile
              firstName={selectedSearchedUser.first_name as string}
              lastName={selectedSearchedUser.last_name as string}
              userId={selectedSearchedUser.id}
              primaryUse={selectedSearchedUser.primary_use as string}
              email={selectedSearchedUser.email}
              avatarUrl={selectedSearchedUser.avatar_url as string}
              aboutMe={null}
            />
          </Modal.Body>
        </Modal>
      )}
      <Form>
        <Form.Select
          className="custom-form-select"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value={USER_TYPE.Landlord}>Landlord</option>
          <option value={USER_TYPE.Housitter}>Housitter</option>
        </Form.Select>
      </Form>
    </div>
  )
}
