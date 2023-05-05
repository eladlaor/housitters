import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import PetsCounter from '../../components/PetsCounter'
import { Button } from 'react-bootstrap'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { userLogout } from '../../utils/auth/userLogout'

export default function CounterTest() {
  const [showNewPostModal, setShowNewPostModal] = useState(false)

  function handleShow() {
    setShowNewPostModal(true)
  }

  return (
    <div>
      <Button onClick={handleShow}></Button>
      <Modal show={showNewPostModal}>
        <Modal.Body>
          <PetsCounter />
        </Modal.Body>
      </Modal>
    </div>
  )
}
