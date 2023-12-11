import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Counter from './Counter'
import '@testing-library/jest-dom'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

describe('Counter component', () => {
  const mockIncrementer = jest.fn()
  const mockDecrementer = jest.fn()

  it('renders without crashing', () => {
    render(
      <Counter
        itemToCount="testItem"
        incrementer={mockIncrementer}
        decrementer={mockDecrementer}
        icon={faCoffee}
        count={5}
      />
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('calls incrementer function on + button click', () => {
    render(
      <Counter
        itemToCount="testItem"
        incrementer={mockIncrementer}
        decrementer={mockDecrementer}
        icon={faCoffee}
        count={5}
      />
    )

    const incrementButton = screen.getByText('+')
    fireEvent.click(incrementButton)
    expect(mockIncrementer).toHaveBeenCalledWith('testItem')
  })

  it('calls decrementer function on - button click', () => {
    render(
      <Counter
        itemToCount="testItem"
        incrementer={mockIncrementer}
        decrementer={mockDecrementer}
        icon={faCoffee}
        count={5}
      />
    )

    const decrementButton = screen.getByText('-')
    fireEvent.click(decrementButton)
    expect(mockDecrementer).toHaveBeenCalledWith('testItem')
  })
})
