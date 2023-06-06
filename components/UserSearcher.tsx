import { Modal, Nav, NavDropdown, Navbar } from 'react-bootstrap'
import { Typeahead, Hint } from 'react-bootstrap-typeahead'

import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Database } from '../types/supabase'

export default function UserSearcher() {
  const user = useUser()
  const supabaseClient = useSupabaseClient()

  const [selectedSearchedUser, setSelectedSearchedUser] = useState(
    {} as Database['public']['Tables']['profiles']['Row'] | null
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
    setSelectedSearchedUser(null)
    setShowSelectedSearchedUserModal(false)
  }

  useEffect(() => {
    if (!user) {
      return
    }

    const loadProfiles = async () => {
      const { error, data } = await supabaseClient.from('profiles').select('*').neq('id', user!.id)

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
      {showSelectedSearchedUserModal && (
        <Modal show={showSelectedSearchedUserModal} onHide={handleCloseSelectedSearchedUserModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              This is {selectedSearchedUser!.first_name} {selectedSearchedUser!.last_name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>according to user type, get from Profile component</Modal.Body>
        </Modal>
      )}
    </>
  )
}
