import { LocationIds, PageRoutes, UserType } from '../utils/constants'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import DatePicker from 'react-datepicker'

import { selectLocationsState as housitterSelectLocationsState } from '../slices/housitterSlice'
import { Button, Modal } from 'react-bootstrap'

// import AvailabilitySelector from '../components/AvailabilitySelector'
import LocationSelector from '../components/LocationSelector'

import React from 'react'
import { DatePickerSelection } from '../types/clientSide'
import moment from 'moment'

export default function Intro() {
  const router = useRouter()
  const dispatch = useDispatch()
  const userType = (router.query.userType || '') as string
  const [isHousitter, setIsHousitter] = useState(userType === UserType.Housitter)
  const [isLoading, setIsLoading] = useState(true)
  const [showSignupOrLoginModal, setShowSignupOrLoginModal] = useState(false)

  const availability = useSelector(selectAvailabilityState)
  const [dateRanges, setDateRanges] = useState([[null, null]] as DatePickerSelection[])
  const housitterLocations = useSelector(housitterSelectLocationsState)

  useEffect(() => {
    if (router.isReady) {
      const userType = (router.query.userType || '') as string
      setIsHousitter(userType === UserType.Housitter)
      setIsLoading(false)
    }
  }, [router.isReady, userType])

  function handleFind() {
    setShowSignupOrLoginModal(true)
  }

  async function updateDateRange(index: number, updatedRange: [null | Date, null | Date]) {
    const ranges = [...dateRanges]
    const modifiedAvailability = [...availability]

    const [updatedStartDate, updatedEndDate] = updatedRange
    if (!updatedStartDate && !updatedEndDate) {
      // the Anytime case
      updatedRange = [new Date(), new Date(0)]
    }

    const formattedStartDate = moment(
      new Date(updatedRange[0] ? updatedRange[0] : new Date())
    ).format('MM-DD-YYYY')

    const formattedEndDate = moment(
      new Date(updatedRange[1] ? updatedRange[1] : new Date(0))
    ).format('MM-DD-YYYY')

    modifiedAvailability[index] = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    }

    ranges[index] = updatedRange

    setDateRanges(ranges)
    dispatch(setAvailability(modifiedAvailability))
  }

  function addDateRange() {
    setDateRanges([...dateRanges, [new Date(), new Date(0)]])
  }

  async function removeDateRange(index: number) {
    const modifiedAvailability = [...availability]
    const ranges = [...dateRanges]

    modifiedAvailability.splice(index, 1)
    ranges.splice(index, 1)
    setDateRanges(ranges)
    dispatch(setAvailability(modifiedAvailability))
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
            {dateRanges &&
              dateRanges.map(([start, end], index) => (
                <div key={index}>
                  <DatePicker
                    selectsRange={true}
                    startDate={end?.getFullYear() === 1970 ? null : start}
                    endDate={end?.getFullYear() === 1970 ? null : end}
                    placeholderText="enter another range"
                    onChange={(value) => {
                      updateDateRange(index, value)
                    }}
                    isClearable={true}
                  />
                  {index === dateRanges.length - 1 && (
                    <div style={{ textAlign: 'right' }}>
                      {dateRanges.length > 1 && (
                        <Button
                          variant="danger"
                          className="mt-4 w-100"
                          onClick={() => removeDateRange(index)}
                        >
                          Remove Range
                        </Button>
                      )}
                      <Button variant="warning" className="mt-4 w-100" onClick={addDateRange}>
                        Add Range
                      </Button>
                    </div>
                  )}
                  <hr />
                </div>
              ))}
            {/* {availability.map((period, index) => (
              <AvailabilitySelector
                key={index}
                period={period}
                index={index}
                updateDbInstantly={false}
              />
            ))} */}
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
          <Modal.Title>
            One More Step to Find Your Next {isHousitter ? 'House' : 'Sitter'}
          </Modal.Title>
        </Modal.Header>
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
