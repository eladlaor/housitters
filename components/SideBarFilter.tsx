import React from 'react'
import Card from 'react-bootstrap/Card'

import { useSelector } from 'react-redux'

import LocationSelector from './LocationSelector'
import { FormCheckType } from 'react-bootstrap/esm/FormCheck'
import AvailabilitySelector from './AvailabilitySelector'
import { selectAvailabilityState, setAvailability } from '../slices/userSlice'
import Sorter from './Sorter'

import { FaFilter, FaSort } from 'react-icons/fa'
import { Row } from 'react-bootstrap'

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
    <Card className="sidebar-filter">
      <div className="sorter-filter">
        <FaSort />
        <h3>Sort by:</h3>
      </div>
      <Sorter sortingProperties={['firstName']} sortElementsHandler={sortElementsHandler} />
      <hr />
      <div className="sorter-filter">
        <FaFilter />
        <h3>Filter by:</h3>
      </div>
      Location:
      <LocationSelector
        isHousitter={isHousitter}
        showCustomLocations={showCustomLocations}
        selectionType={selectionType as FormCheckType}
        updateDbInstantly={true}
      />
      Dates:
      {availabaility.map((period, index) => (
        <AvailabilitySelector period={period} index={index} key={index} updateDbInstantly={true} />
      ))}
    </Card>
  )
}
