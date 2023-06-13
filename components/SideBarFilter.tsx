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
      <h2>Sort by:</h2>

      <Sorter sortingProperties={['firstName']} sortElementsHandler={sortElementsHandler} />
      <hr style={{ borderTop: '20px solid #000' }} />

      <h2>Filter by:</h2>
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
