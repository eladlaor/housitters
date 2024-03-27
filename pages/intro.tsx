import { LocationIds, PageRoutes, UserType } from '../utils/constants'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import DatePicker from 'react-datepicker'

import { selectLocationsState as housitterSelectLocationsState } from '../slices/housitterSlice'
import { Button, Modal } from 'react-bootstrap'
import LocationSelector from '../components/LocationSelector'

import React from 'react'
import { DatePickerSelection } from '../types/clientSide'
import moment from 'moment'
import { isRangeAnytime } from '../utils/dates'
import { useTranslation } from 'react-i18next'

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

  const { t } = useTranslation()

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
        <div className="position-absolute top-70 start-10 translate-middle text-center">
          <div>
            <h1 className="mb-4">
              {t('intro.part1')}
              {isHousitter ? t('intro.sitterFind') : t('intro.landlordFind')}
            </h1>
          </div>
          <div>
            <h3>{t('intro.when')}</h3>
            {dateRanges &&
              dateRanges.map(([start, end], index) => (
                <div key={index} className="styled-datepicker">
                  <DatePicker
                    selectsRange={true}
                    startDate={end?.getFullYear() === 1970 ? null : start}
                    endDate={end?.getFullYear() === 1970 ? null : end}
                    placeholderText={
                      dateRanges.length > 1
                        ? t('sidebarFilter.dates.addRange')
                        : t('sidebarFilter.dates.anytime')
                    }
                    onChange={(value) => {
                      updateDateRange(index, value)
                    }}
                    isClearable={true}
                  />
                  {!isRangeAnytime(dateRanges[0]) && index === dateRanges.length - 1 && (
                    <div className="styled-datepicker">
                      {dateRanges.length > 1 && (
                        <Button
                          variant="danger"
                          className="styled-datepicker"
                          onClick={() => removeDateRange(index)}
                        >
                          {t('sidebarFilter.dates.removeRange')}
                        </Button>
                      )}
                      <Button
                        variant="warning"
                        className="styled-datepicker"
                        onClick={addDateRange}
                      >
                        {t('sidebarFilter.dates.addRange')}
                      </Button>
                    </div>
                  )}
                  <hr />
                </div>
              ))}
          </div>
          <div>
            <h3>{t('intro.where')}</h3>
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
              {t('intro.find')}
            </Button>
          </div>
        </div>
      </div>
      <Modal show={showSignupOrLoginModal} onHide={() => setShowSignupOrLoginModal(false)}>
        <Modal.Header className="d-flex justify-content-center">
          <Modal.Title>
            {t('intro.oneMoreStep')} {isHousitter ? t('intro.house') : t('intro.sitter')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            variant="success"
            onClick={() => router.push({ pathname: PageRoutes.Auth.Login, query: { userType } })}
          >
            {t('login.login')}
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push({ pathname: PageRoutes.Auth.Signup, query: { userType } })}
          >
            {t('login.signup')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
