import { Modal } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

import { Database } from '../types/supabase'
import PublicProfile from './PublicProfile'

export default function UserSearcher() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const noSelectedSearchedUser: Database['public']['Tables']['profiles']['Row'] = {
    about_me: '',
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
    visible: true,
  }

  const [selectedSearchedUser, setSelectedSearchedUser] = useState(
    noSelectedSearchedUser as Database['public']['Tables']['profiles']['Row']
  )
  const [showSelectedSearchedUserModal, setShowSelectedSearchedUserModal] = useState(false)
  const [allProfiles, setAllProfiles] = useState(
    [] as Database['public']['Tables']['profiles']['Row'][]
  )

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
      const { error, data } = await supabaseClient
        .from('profiles')
        .select(
          'id, first_name, last_name, primary_use, username, social_media_url, email, birthday, about_me, avatar_url'
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
  }, [user])

  return (
    <>
      <Typeahead
        id="user-search"
        labelKey="first_name"
        options={allProfiles}
        placeholder="Search for a user by name"
        onChange={handleSelectedSearchedUser}
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
              userId={selectedSearchedUser.id}
              primaryUse={selectedSearchedUser.primary_use as string}
              email={selectedSearchedUser.email}
              aboutMe={selectedSearchedUser.about_me}
              avatarUrl={selectedSearchedUser.avatar_url}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  )
}
