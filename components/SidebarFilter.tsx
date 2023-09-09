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
    <Sorter
      sortingProperties={Object.values(
        isHousitter ? SortingProperties.HousitterDashboard : SortingProperties.LandlordDashboard
      )}
      sortElementsHandler={sortElementsHandler}
    />
  )
}
