import { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'
import { BsArrowUp, BsArrowDown } from 'react-icons/bs'
import { SortingPropertiesForHandler } from '../utils/constants'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'

export default function Sorter(props: {
  sortingProperties: string[]
  sortElementsHandler: Function
}) {
  const { sortingProperties, sortElementsHandler } = props
  const { t } = useTranslation()
  const [selectedSortingProperty, setSelectedSortingProperty] = useState(sortingProperties[0])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()
  const { locale } = router

  function handleSelection(e: any) {
    const sortByProperty = e.target.value
    setSelectedSortingProperty(sortByProperty)
    sortElementsHandler(SortingPropertiesForHandler[sortByProperty], sortOrder)
  }

  function handleSortOrderChange(e: any) {
    const newSortOrder = e.target.value
    setSortOrder(newSortOrder)
    sortElementsHandler(SortingPropertiesForHandler[selectedSortingProperty], newSortOrder)
  }

  return (
    <div>
      <Form>
        <div className="d-flex justify-content-center mb-3">
          <div className="d-flex align-items-center">
            <Form.Check
              type="radio"
              value="asc"
              checked={sortOrder === 'asc'}
              onChange={handleSortOrderChange}
              inline
              name="sortOrder"
              id="radio-asc"
              label={selectedSortingProperty === 'gender' ? '♂' : <BsArrowDown />}
            />
            <Form.Check
              type="radio"
              value="desc"
              checked={sortOrder === 'desc'}
              onChange={handleSortOrderChange}
              inline
              name="sortOrder"
              id="radio-desc"
              label={selectedSortingProperty === 'gender' ? '♀' : <BsArrowUp />}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <Form.Select
            value={selectedSortingProperty}
            onChange={handleSelection}
            aria-label="Sort by"
          >
            {sortingProperties.map((property, index) => (
              <option key={index} value={property}>
                {t(`sidebarFilter.sort.${property}`)}
              </option>
            ))}
          </Form.Select>
        </div>
      </Form>
    </div>
  )
}
