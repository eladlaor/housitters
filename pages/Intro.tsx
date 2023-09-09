import { LocationIds, PageRoutes, UserType } from '../utils/constants'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { selectAvailabilityState } from '../slices/userSlice'

import { selectLocationsState as housitterSelectLocationsState } from '../slices/housitterSlice'
import { Button, Modal } from 'react-bootstrap'

import AvailabilitySelector from '../components/AvailabilitySelector'
import LocationSelector from '../components/LocationSelector'

import React from 'react'

export default function Intro() {
  const router = useRouter()

  const userType = (router.query.userType || '') as string
  const [isHousitter, setIsHousitter] = useState(userType === UserType.Housitter)
  const [isLoading, setIsLoading] = useState(true)
  const [showSignupOrLoginModal, setShowSignupOrLoginModal] = useState(false)

  const availability = useSelector(selectAvailabilityState)
  const housitterLocations = useSelector(housitterSelectLocationsState)

  useEffect(() => {
    if (router.isReady) {
      const userType = (router.query.userType || '') as string
      setIsHousitter(userType === UserType.Housitter)
      setIsLoading(false)
    }
  }, [router.isReady])

  function handleFind() {
    setShowSignupOrLoginModal(true)
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div>
        <div className="position-absolute top-70 start-70 translate-middle text-center">
          <div>
            <h1 className="mb-4">
              let's find
              {isHousitter ? ' a woof over your head' : ' a great housitter for you'}
            </h1>
          </div>
          <div>
            <h3>When?</h3>
            {availability.map((period, index) => (
              <AvailabilitySelector
                key={index}
                period={period}
                index={index}
                updateDbInstantly={false}
              />
            ))}
          </div>
          <div>
            <h3>Where?</h3>
            {!isLoading && (
              <LocationSelector
                selectionType={isHousitter ? 'checkbox' : 'radio'}
                isHousitter={isHousitter}
                showCustomLocations={
                  isHousitter
                    ? housitterLocations.length > 0 &&
                      housitterLocations.length < Object.values(LocationIds).length
                    : true
                }
                updateDbInstantly={false}
              />
            )}
          </div>
          <div>
            <Button
              variant="success"
              onClick={handleFind}
              className="btn-lg rounded-pill w-50 mt-3"
            >
              Find
            </Button>
          </div>
        </div>
      </div>
      <Modal show={showSignupOrLoginModal} onHide={() => setShowSignupOrLoginModal(false)}>
        <Modal.Header className="d-flex justify-content-center">
          <Modal.Title>One More Step</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center">
          Join the community to find your next {isHousitter ? 'houses' : 'sitters'}:
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            variant="success"
            onClick={() => router.push({ pathname: PageRoutes.Auth.Login, query: { userType } })}
          >
            Login
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push({ pathname: PageRoutes.Auth.Signup, query: { userType } })}
          >
            Free Signup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
