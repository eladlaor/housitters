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
import { SortingProperties } from '../utils/constants'

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
        <h4>Sort by:</h4>
      </div>
      <div>
        <Sorter
          sortingProperties={Object.values(
            isHousitter ? SortingProperties.HousitterDashboard : SortingProperties.LandlordDashboard
          )}
          sortElementsHandler={sortElementsHandler}
        />
        <hr />
      </div>
      {isHousitter && (
        <>
          <div className="sorter-filter">
            <h4>Filter by:</h4>
          </div>
          Location:
          <LocationSelector
            isHousitter={isHousitter}
            showCustomLocations={showCustomLocations}
            selectionType={selectionType as FormCheckType}
            updateDbInstantly={true}
          />
        </>
      )}
      Dates:
      {availabaility.map((period, index) => (
        <AvailabilitySelector period={period} index={index} key={index} updateDbInstantly={true} />
      ))}
    </Card>
  )
}
