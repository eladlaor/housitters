import { useRouter } from 'next/router'
import GoToProfileButton from '../../components/GoToProfileButton'
import { selectFirstNameState } from '../../slices/userSlice'
import { LANDLORDS_ROUTES } from '../../utils/constants'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../../slices/userSlice'
import AvailabilityPeriod from '../../components/AvailabilityPeriod'

export default function Home() {
  const router = useRouter()
  const firstName = useSelector(selectFirstNameState)
  const availability = useSelector(selectAvailabilityState)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [imagesSrc, setImagesSrc] = useState([] as any)

  function handleShowNewPostModal() {
    setShowNewPostModal(true)
  }

  function handleCloseNoewPostModal() {
    setShowNewPostModal(false)
  }

  // why would i decide to use '
  function onFileUpload(e: any) {
    for (const file of e.target.files) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setImagesSrc((images: any) => [...images, reader.result])
      }

      reader.onerror = () => {
        console.log(reader.error)
        throw reader.error
      }
    }
  }

  return (
    <div>
      <h1>Mazal tov {firstName} on your upcoming vacation!</h1>
      <GoToProfileButton accountRoute={LANDLORDS_ROUTES.ACCOUNT} />
      <div>
        <Button variant="primary" onClick={handleShowNewPostModal}>
          Create new post
        </Button>
        <Modal show={showNewPostModal} onHide={handleCloseNoewPostModal}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: 'blue' }}>lets create new post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                {availability.map((period, index) => (
                  <AvailabilityPeriod key={index} period={period} index={index} />
                ))}
              </Form.Group>
              <Form.Group>
                <h1 style={{ color: 'blue' }}>free text</h1>
                <Form.Control className="text-end" size="sm" as="textarea" rows={5}></Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Upload some pics</Form.Label>
                <input onChange={onFileUpload} type="file" name="file" multiple />
                {imagesSrc.map((link: any) => (
                  <img src={link} />
                ))}
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  here i would retrieve the pets from the db, and display them as a pet component.
                </Form.Label>
              </Form.Group>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  )
}
