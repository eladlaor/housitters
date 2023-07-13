import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import { BsArrowUp, BsArrowDown } from 'react-icons/bs'
import { SortingPropertiesForHandler } from '../utils/constants'

export default function Sorter(props: {
  sortingProperties: string[]
  sortElementsHandler: Function
}) {
  const { sortingProperties, sortElementsHandler } = props

  const [selectedSortingProperty, setSelectedSortingProperty] = useState('first name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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
              label={<BsArrowUp />}
            />
            <Form.Check
              type="radio"
              value="desc"
              checked={sortOrder === 'desc'}
              onChange={handleSortOrderChange}
              inline
              name="sortOrder"
              id="radio-desc"
              label={<BsArrowDown />}
            />
          </div>
        </div>

        {sortingProperties.map((property, index) => (
          <div key={index}>
            <Form.Check
              type="radio"
              value={property}
              checked={selectedSortingProperty === property}
              onChange={handleSelection}
              inline
              name="sortOption"
              id={`radio-${property}`}
              label={property}
            />
            <br />
          </div>
        ))}
      </Form>
    </div>
  )
}
