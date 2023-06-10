import { useState } from 'react'
import Form from 'react-bootstrap/Form'

export default function Sorter(props: { sortingProperties: string[]; sortElements: Function }) {
  const { sortingProperties, sortElements } = props

  const [selectedSortingProperty, setSelectedSortingProperty] = useState('')

  function handleSelection(e: any) {
    const sortByProperty = e.target.value
    setSelectedSortingProperty(sortByProperty)
    sortElements(sortByProperty)
  }

  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <h1>Sorter</h1>
      <Form>
        {sortingProperties.map((property, index) => (
          <Form.Check
            type="radio"
            value={property}
            key={index}
            checked={selectedSortingProperty === property}
            onChange={handleSelection}
            inline
            name="sortOption"
            label={property}
            id={`radio-${property}`}
          />
        ))}
      </Form>
    </div>
  )
}
