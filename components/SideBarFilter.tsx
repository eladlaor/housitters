import React from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'

import { useDispatch, useSelector } from 'react-redux'
import { selectLocationState } from '../slices/landlordSlice'
import { selectLocationsState, setLocationsState } from '../slices/housitterSlice'
import LocationSelector from './LocationSelector'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'
import AvailabilitySelector from './AvailabilitySelector'
import { selectAvailabilityState, setAvailability } from '../slices/userSlice'

export default function SidebarFilter({
  isHousitter,
  showCustomLocations,
  selectionType,
}: {
  isHousitter: boolean
  showCustomLocations: boolean
  selectionType: string
}) {
  const availabaility = useSelector(selectAvailabilityState)
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
      }}
    >
      <Card style={{ height: '100%', width: '30%' }}>
        <LocationSelector
          isHousitter={isHousitter}
          showCustomLocations={showCustomLocations}
          selectionType={selectionType as FormCheckType}
          updateDbInstantly={true}
        />
        <hr />
        {availabaility.map((period, index) => (
          <AvailabilitySelector
            period={period}
            index={index}
            key={index}
            updateDbInstantly={true}
          />
        ))}
      </Card>
    </div>
  )
}
