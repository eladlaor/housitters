import React from 'react'
import Card from 'react-bootstrap/Card'

import { useSelector } from 'react-redux'

import LocationSelector from './LocationSelector'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'
import AvailabilitySelector from './AvailabilitySelector'
import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import Sorter from './Sorter'

export default function SidebarFilter({
  isHousitter,
  showCustomLocations,
  selectionType,
  sortElementsHandler,
}: {
  isHousitter: boolean
  showCustomLocations: boolean
  selectionType: string
  sortElementsHandler: Function
}) {
  const availabaility = useSelector(selectAvailabilityState)
  return (
    <Card>
      <Sorter sortingProperties={['firstName']} sortElementsHandler={sortElementsHandler} />
      <h3>Filter by:</h3>
      <LocationSelector
        isHousitter={isHousitter}
        showCustomLocations={showCustomLocations}
        selectionType={selectionType as FormCheckType}
        updateDbInstantly={true}
      />
      <hr style={{ borderTop: '20px solid #000' }} />
      {availabaility.map((period, index) => (
        <AvailabilitySelector period={period} index={index} key={index} updateDbInstantly={true} />
      ))}
    </Card>
  )
}
